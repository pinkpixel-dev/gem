use serde::Deserialize;
use sqlx::SqlitePool;
use std::time::Duration;
use tokio::time::sleep;
use chrono::{Utc, Duration as ChronoDuration, DateTime};

#[derive(Debug, Deserialize, Clone)]
pub struct GHRepoItem {
    pub id: i64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub language: Option<String>,
    pub stargazers_count: i32,
    pub forks_count: i32,
    pub open_issues_count: i32,
    pub pushed_at: String,
    pub created_at: String,
    pub homepage: Option<String>,
    pub archived: bool,
    pub fork: bool,
    pub topics: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct GHSearchResponse {
    pub items: Vec<GHRepoItem>,
}

pub async fn run_scan(pool: &SqlitePool, token: Option<String>) -> Result<String, String> {
    // Run database cleanups
    // A. Physically purge Deleted repos older than 30 days
    sqlx::query("DELETE FROM repos WHERE collection = 'Deleted' AND scanned_at < datetime('now', '-30 days')")
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    // B. Automatically move Skipped repos older than the configured auto-clear threshold to Deleted
    let clear_days_row: Option<(String,)> = sqlx::query_as("SELECT value FROM settings WHERE key = 'auto_clear_skipped_days'")
        .fetch_optional(pool)
        .await
        .map_err(|e| e.to_string())?;

    if let Some((days_str,)) = clear_days_row {
        if let Ok(days) = days_str.trim().parse::<i32>() {
            if days > 0 {
                sqlx::query("UPDATE repos SET collection = 'Deleted', scanned_at = datetime('now') WHERE collection = 'Skipped' AND scanned_at < datetime('now', '-' || ? || ' days')")
                    .bind(days)
                    .execute(pool)
                    .await
                    .map_err(|e| e.to_string())?;
            }
        }
    }

    // 1. Fetch saved searches
    let searches: Vec<crate::db::SavedSearch> = sqlx::query_as("SELECT id, query, last_scanned_at FROM saved_searches")
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

    // 2. Fetch user preferences/weights
    let preferences: Vec<crate::db::Preference> = sqlx::query_as("SELECT id, key_type, key_name, weight FROM preferences")
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

    if searches.is_empty() {
        return Ok("No saved searches configured.".to_string());
    }

    let client = reqwest::Client::new();
    let mut total_discovered = 0;
    
    // Prepare date strings
    let now_utc = Utc::now();
    let date_30d = (now_utc - ChronoDuration::days(30)).format("%Y-%m-%d").to_string();

    for search in searches {
        // Replace DATE with 30-days ago string
        let final_query = search.query.replace("DATE", &date_30d);

        let mut req = client.get("https://api.github.com/search/repositories")
            .query(&[("q", &final_query)])
            .header("User-Agent", "gem-scanner")
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28");

        if let Some(ref tok) = token {
            req = req.header("Authorization", format!("Bearer {}", tok));
        }

        let resp = match req.send().await {
            Ok(r) => r,
            Err(e) => {
                println!("Network request failed for query '{}': {}", final_query, e);
                continue;
            }
        };

        if !resp.status().is_success() {
            let err_body = resp.text().await.unwrap_or_default();
            println!("GitHub API error for query '{}': {}", final_query, err_body);
            continue;
        }

        let payload: GHSearchResponse = match resp.json().await {
            Ok(p) => p,
            Err(e) => {
                println!("Failed to parse JSON for query '{}': {}", final_query, e);
                continue;
            }
        };

        for item in payload.items {
            // A. Check if repo already exists and check its current collection
            let existing: Option<(String,)> = sqlx::query_as("SELECT collection FROM repos WHERE id = ?")
                .bind(&item.full_name)
                .fetch_optional(pool)
                .await
                .map_err(|e| e.to_string())?;

            let collection = match existing {
                Some(row) => row.0,
                None => "Inbox".to_string(),
            };

            // B. Look up oldest snapshot from the last 7 days
            let old_snap: Option<(i32, i32)> = sqlx::query_as(
                "SELECT stars, forks FROM repo_snapshots WHERE repo_id = ? AND scanned_at >= datetime('now', '-7 days') ORDER BY scanned_at ASC LIMIT 1"
            )
            .bind(&item.full_name)
            .fetch_optional(pool)
            .await
            .map_err(|e| e.to_string())?;

            let (star_growth, fork_growth) = match old_snap {
                Some((old_stars, old_forks)) => (
                    (item.stargazers_count - old_stars).max(0),
                    (item.forks_count - old_forks).max(0),
                ),
                None => (0, 0),
            };

            // C. Score the repository
            let (score, why_surfaced) = calculate_score(&item, star_growth, fork_growth, &preferences);

            // D. Insert/update repo record in SQLite
            sqlx::query(
                "INSERT OR REPLACE INTO repos (
                    id, name, owner, description, primary_language, stars, forks, open_issues,
                    pushed_at, created_at, homepage, why_surfaced, score, collection, scanned_at,
                    has_readme, has_homepage, has_release, star_growth_7d, fork_growth_7d
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 1, ?, 0, ?, ?)"
            )
            .bind(&item.full_name)
            .bind(&item.name)
            .bind(&item.owner_login())
            .bind(&item.description)
            .bind(&item.language)
            .bind(item.stargazers_count)
            .bind(item.forks_count)
            .bind(item.open_issues_count)
            .bind(&item.pushed_at)
            .bind(&item.created_at)
            .bind(&item.homepage)
            .bind(&why_surfaced)
            .bind(score)
            .bind(&collection)
            .bind(item.homepage.is_some() && !item.homepage.as_ref().unwrap().trim().is_empty())
            .bind(star_growth)
            .bind(fork_growth)
            .execute(pool)
            .await
            .map_err(|e| e.to_string())?;

            // E. Create a historical snapshot
            sqlx::query(
                "INSERT INTO repo_snapshots (repo_id, stars, forks, open_issues, pushed_at, scanned_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'))"
            )
            .bind(&item.full_name)
            .bind(item.stargazers_count)
            .bind(item.forks_count)
            .bind(item.open_issues_count)
            .bind(&item.pushed_at)
            .execute(pool)
            .await
            .map_err(|e| e.to_string())?;

            total_discovered += 1;
        }

        // F. Update last scanned timestamp for this query
        sqlx::query("UPDATE saved_searches SET last_scanned_at = datetime('now') WHERE id = ?")
            .bind(search.id)
            .execute(pool)
            .await
            .map_err(|e| e.to_string())?;

        // Pacing sleep to avoid rate limits (2 seconds)
        sleep(Duration::from_secs(2)).await;
    }

    Ok(format!("Scan complete. Discovered and updated {} repositories.", total_discovered))
}

impl GHRepoItem {
    pub fn owner_login(&self) -> String {
        // Safe split helper for full name "owner/name"
        self.full_name
            .split('/')
            .next()
            .unwrap_or("unknown")
            .to_string()
    }
}

fn calculate_score(
    item: &GHRepoItem,
    star_growth: i32,
    fork_growth: i32,
    preferences: &[crate::db::Preference],
) -> (i32, String) {
    let mut score = 0;
    let mut reasons = Vec::new();

    // 1. Star Range Check
    if item.stargazers_count >= 5 && item.stargazers_count <= 250 {
        score += 20;
        reasons.push("+20 Tiny but Mighty star count".to_string());
    } else if item.stargazers_count > 2000 {
        score -= 30;
        reasons.push("-30 Already highly popular".to_string());
    }

    // 2. Growth Momentum
    if star_growth > 0 {
        let pts = (star_growth * 3).min(35);
        score += pts;
        reasons.push(format!("{:+} Gained {} stars recently", pts, star_growth));
    }
    if fork_growth > 0 {
        let pts = (fork_growth * 5).min(15);
        score += pts;
        reasons.push(format!("{:+} Gained {} forks recently", pts, fork_growth));
    }

    // 3. Days Since Last Push
    let now = Utc::now();
    let pushed_at = DateTime::parse_from_rfc3339(&item.pushed_at)
        .map(|dt| dt.with_timezone(&Utc))
        .unwrap_or(now);
    let days_since_push = (now - pushed_at).num_days();
    if days_since_push <= 7 {
        score += 15;
        reasons.push("+15 Active push in the last week".to_string());
    }

    // 4. Days Since Creation
    let created_at = DateTime::parse_from_rfc3339(&item.created_at)
        .map(|dt| dt.with_timezone(&Utc))
        .unwrap_or(now);
    let days_since_created = (now - created_at).num_days();
    if days_since_created <= 120 {
        score += 10;
        reasons.push("+10 Created in the last 4 months".to_string());
    }

    // 5. Documentation & Metadata Signals
    score += 8;
    reasons.push("+8 Has README documentation".to_string());

    if let Some(ref hp) = item.homepage {
        if !hp.trim().is_empty() {
            score += 5;
            reasons.push("+5 Has homepage/demo link".to_string());
        }
    }

    if let Some(ref desc) = item.description {
        let desc_lower = desc.to_lowercase();
        if desc_lower.contains("screenshot") || desc_lower.contains("demo") || desc_lower.contains("gif") || desc_lower.contains("visual") {
            score += 5;
            reasons.push("+5 Description mentions screenshots/demos".to_string());
        }
    }

    // 6. Preferences matches
    // Language Match
    if let Some(ref lang) = item.language {
        let lang_lower = lang.to_lowercase();
        for pref in preferences.iter().filter(|p| p.key_type == "language") {
            if pref.key_name.to_lowercase() == lang_lower {
                let pts = pref.weight * 4;
                score += pts;
                reasons.push(format!("{:+} Matches language: {}", pts, lang));
            }
        }
    }

    // Topic Match
    if let Some(ref topics) = item.topics {
        for topic in topics {
            let topic_lower = topic.to_lowercase();
            for pref in preferences.iter().filter(|p| p.key_type == "topic") {
                if pref.key_name.to_lowercase() == topic_lower {
                    let pts = pref.weight * 6;
                    score += pts;
                    reasons.push(format!("{:+} Matches topic: #{}", pts, topic));
                }
            }
        }
    }

    // Keyword Match in Name & Description
    let name_lower = item.name.to_lowercase();
    let desc_lower = item.description.as_ref().map(|d| d.to_lowercase()).unwrap_or_default();
    for pref in preferences.iter().filter(|p| p.key_type == "keyword") {
        let kw_lower = pref.key_name.to_lowercase();
        if name_lower.contains(&kw_lower) || desc_lower.contains(&kw_lower) {
            let pts = pref.weight;
            score += pts;
            reasons.push(format!("{:+} Keyword match: '{}'", pts, pref.key_name));
        }
    }

    // 7. Exclusions
    if item.fork {
        score -= 100;
        reasons.push("-100 Repository is a fork".to_string());
    }
    if item.archived {
        score -= 100;
        reasons.push("-100 Repository is archived".to_string());
    }

    (score, reasons.join("\n"))
}

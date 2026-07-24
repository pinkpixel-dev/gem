use crate::db::{Repo, Preference, SavedSearch};
use tauri::State;

pub struct DbState {
    pub pool: sqlx::SqlitePool,
}

#[tauri::command]
pub async fn get_repos(collection: String, state: State<'_, DbState>) -> Result<Vec<Repo>, String> {
    sqlx::query_as::<_, Repo>("SELECT * FROM repos WHERE collection = ? ORDER BY score DESC, scanned_at DESC")
        .bind(collection)
        .fetch_all(&state.pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn perform_repo_action(repo_id: String, action: String, state: State<'_, DbState>) -> Result<(), String> {
    let mut tx = state.pool.begin().await.map_err(|e| e.to_string())?;

    // Determine target collection based on action
    let collection = match action.as_str() {
        "save" | "Gems" => "Gems",
        "maybe" | "Tools to Try" => "Tools to Try",
        "skip" | "Skipped" => "Skipped",
        "inbox" | "Inbox" => "Inbox",
        "delete" | "Deleted" | "remove" | "Remove" => "Deleted",
        _ => "Inbox",
    };

    sqlx::query("UPDATE repos SET collection = ? WHERE id = ?")
        .bind(collection)
        .bind(&repo_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("INSERT INTO repo_actions (repo_id, action, performed_at) VALUES (?, ?, datetime('now'))")
        .bind(&repo_id)
        .bind(&action)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn bulk_repo_action(repo_ids: Vec<String>, action: String, state: State<'_, DbState>) -> Result<(), String> {
    let collection = match action.as_str() {
        "save" | "Gems" => "Gems",
        "maybe" | "Tools to Try" => "Tools to Try",
        "skip" | "Skipped" => "Skipped",
        "inbox" | "Inbox" => "Inbox",
        "delete" | "Deleted" | "remove" | "Remove" => "Deleted",
        _ => "Inbox",
    };

    let mut tx = state.pool.begin().await.map_err(|e| e.to_string())?;

    for repo_id in &repo_ids {
        sqlx::query("UPDATE repos SET collection = ? WHERE id = ?")
            .bind(collection)
            .bind(repo_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

        sqlx::query("INSERT INTO repo_actions (repo_id, action, performed_at) VALUES (?, ?, datetime('now'))")
            .bind(repo_id)
            .bind(&action)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_preferences(state: State<'_, DbState>) -> Result<Vec<Preference>, String> {
    sqlx::query_as::<_, Preference>("SELECT * FROM preferences ORDER BY weight DESC")
        .fetch_all(&state.pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_preference(key_type: String, key_name: String, weight: i32, state: State<'_, DbState>) -> Result<(), String> {
    sqlx::query("INSERT INTO preferences (key_type, key_name, weight) VALUES (?, ?, ?) ON CONFLICT(key_type, key_name) DO UPDATE SET weight = excluded.weight")
        .bind(key_type)
        .bind(key_name)
        .bind(weight)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_saved_searches(state: State<'_, DbState>) -> Result<Vec<SavedSearch>, String> {
    sqlx::query_as::<_, SavedSearch>("SELECT * FROM saved_searches")
        .fetch_all(&state.pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_saved_search(query: String, state: State<'_, DbState>) -> Result<(), String> {
    sqlx::query("INSERT OR IGNORE INTO saved_searches (query) VALUES (?)")
        .bind(query)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_github_token(state: State<'_, DbState>) -> Result<Option<String>, String> {
    // Check environment variable first
    if let Ok(token) = std::env::var("GITHUB_TOKEN") {
        if !token.trim().is_empty() {
            return Ok(Some(token));
        }
    }

    // Fallback to settings table
    let row: Option<(String,)> = sqlx::query_as("SELECT value FROM settings WHERE key = 'github_token'")
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(row.map(|r| r.0))
}

#[tauri::command]
pub async fn set_github_token(token: String, state: State<'_, DbState>) -> Result<(), String> {
    sqlx::query("INSERT INTO settings (key, value) VALUES ('github_token', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
        .bind(token)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionCount {
    pub name: String,
    pub count: i32,
}

#[tauri::command]
pub async fn get_collection_counts(state: State<'_, DbState>) -> Result<Vec<CollectionCount>, String> {
    let rows: Vec<(String, i32)> = sqlx::query_as(
        "SELECT collection, COUNT(*) FROM repos GROUP BY collection"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut counts = vec![
        CollectionCount { name: "Inbox".to_string(), count: 0 },
        CollectionCount { name: "Gems".to_string(), count: 0 },
        CollectionCount { name: "Tools to Try".to_string(), count: 0 },
        CollectionCount { name: "Skipped".to_string(), count: 0 },
    ];

    for (name, count) in rows {
        if let Some(c) = counts.iter_mut().find(|c| c.name == name) {
            c.count = count;
        }
    }

    Ok(counts)
}

#[tauri::command]
pub async fn scan_now(state: State<'_, DbState>) -> Result<String, String> {
    let token = get_github_token(state.clone()).await.ok().flatten();
    crate::scanner::run_scan(&state.pool, token).await
}

#[tauri::command]
pub async fn delete_saved_search(id: i32, state: State<'_, DbState>) -> Result<(), String> {
    sqlx::query("DELETE FROM saved_searches WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_preference(id: i32, state: State<'_, DbState>) -> Result<(), String> {
    sqlx::query("DELETE FROM preferences WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn open_in_browser(url: String) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        // Clear LD_LIBRARY_PATH on Linux to prevent AppImage library conflicts with host tools
        std::process::Command::new("xdg-open")
            .arg(&url)
            .env_remove("LD_LIBRARY_PATH")
            .spawn()
            .map_err(|e| format!("Failed to run xdg-open: {}", e))?;
        Ok(())
    }
    #[cfg(not(target_os = "linux"))]
    {
        #[cfg(target_os = "windows")]
        {
            std::process::Command::new("cmd")
                .args(["/C", "start", "", &url])
                .spawn()
                .map_err(|e| format!("Failed to run cmd start: {}", e))?;
        }
        #[cfg(target_os = "macos")]
        {
            std::process::Command::new("open")
                .arg(&url)
                .spawn()
                .map_err(|e| format!("Failed to run open: {}", e))?;
        }
        Ok(())
    }
}

#[tauri::command]
pub async fn get_setting(key: String, state: State<'_, DbState>) -> Result<Option<String>, String> {
    let row: Option<(String,)> = sqlx::query_as("SELECT value FROM settings WHERE key = ?")
        .bind(key)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(row.map(|r| r.0))
}

#[tauri::command]
pub async fn set_setting(key: String, value: String, state: State<'_, DbState>) -> Result<(), String> {
    sqlx::query("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
        .bind(key)
        .bind(value)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn clear_skipped_repos(state: State<'_, DbState>) -> Result<(), String> {
    // Instead of deleting immediately, set collection = 'Deleted' and scanned_at = datetime('now')
    // so they are blocked from reappearing during subsequent scans.
    sqlx::query("UPDATE repos SET collection = 'Deleted', scanned_at = datetime('now') WHERE collection = 'Skipped'")
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn clear_inbox_repos(state: State<'_, DbState>) -> Result<(), String> {
    // Instead of deleting immediately, set collection = 'Deleted' and scanned_at = datetime('now')
    // so they are blocked from reappearing during subsequent scans.
    sqlx::query("UPDATE repos SET collection = 'Deleted', scanned_at = datetime('now') WHERE collection = 'Inbox'")
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

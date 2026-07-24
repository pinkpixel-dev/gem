use serde::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Repo {
    pub id: String,
    pub name: String,
    pub owner: String,
    pub description: Option<String>,
    pub primary_language: Option<String>,
    pub stars: i32,
    pub forks: i32,
    pub open_issues: i32,
    pub pushed_at: Option<String>,
    pub created_at: Option<String>,
    pub homepage: Option<String>,
    pub latest_release_name: Option<String>,
    pub latest_release_published_at: Option<String>,
    pub why_surfaced: Option<String>,
    pub score: i32,
    pub collection: Option<String>,
    pub scanned_at: String,
    pub has_readme: i32,
    pub has_homepage: i32,
    pub has_release: i32,
    pub star_growth_7d: i32,
    pub fork_growth_7d: i32,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SavedSearch {
    pub id: i32,
    pub query: String,
    pub last_scanned_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Preference {
    pub id: i32,
    pub key_type: String,
    pub key_name: String,
    pub weight: i32,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Setting {
    pub key: String,
    pub value: String,
}

pub async fn init_db(app_data_dir: PathBuf) -> Result<SqlitePool, sqlx::Error> {
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir).map_err(|e| {
            std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to create app data dir: {}", e),
            )
        })?;
    }

    let db_path = app_data_dir.join("scanner.db");
    
    let pool = SqlitePool::connect_with(
        sqlx::sqlite::SqliteConnectOptions::new()
            .filename(&db_path)
            .create_if_missing(true),
    )
    .await?;

    // Run compile-time embedded migrations
    sqlx::migrate!("./migrations").run(&pool).await?;

    Ok(pool)
}

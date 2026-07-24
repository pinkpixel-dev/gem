mod db;
mod commands;
mod scanner;

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Stop GTK/GIO from loading ANY dynamically-scanned GIO extension module
    // (e.g. the GnuTLS TLS backend) on first window creation. This app never
    // uses GIO's TLS/proxy/dconf/gvfs extension points - all networking goes
    // through reqwest in the Rust backend, and the webview only ever loads
    // local bundled content - so no functionality is lost by disabling them.
    //
    // Why this matters: the bundled AppImage carries its own copies of
    // nettle/hogweed/gnutls/p11-kit/leancrypto, but `libgmp` is NOT bundled,
    // so it's always resolved live from the host. If the host's crypto
    // libraries are updated (a routine CachyOS package update) after the
    // AppImage was built, the bundled (now-stale) nettle/gnutls/leancrypto
    // combined with the host's current libgmp can be ABI-incompatible,
    // segfaulting deep inside GIO's module scan the moment it's triggered
    // (here, via the first GTK CSS provider load during window creation).
    // Pointing both GIO_MODULE_DIR (the compiled-in host default) and
    // GIO_EXTRA_MODULES (set by the AppImage's own AppRun script to its
    // bundled modules dir) at nonexistent paths skips module scanning
    // entirely, sidestepping the mismatch regardless of which side is stale.
    #[cfg(target_os = "linux")]
    unsafe {
        std::env::set_var("GIO_MODULE_DIR", "/nonexistent-gem-gio-modules");
        std::env::set_var("GIO_EXTRA_MODULES", "/nonexistent-gem-gio-modules");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let home_dir = app.path().home_dir()
                .expect("Failed to resolve user home directory");
            let app_data_dir = home_dir.join(".gem");

            // Initialize database synchronously within setup using Tauri's async runtime
            let pool = tauri::async_runtime::block_on(async {
                db::init_db(app_data_dir).await.expect("Failed to initialize SQLite database")
            });

            // Register database state
            app.manage(commands::DbState { pool });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::get_repos,
            commands::perform_repo_action,
            commands::bulk_repo_action,
            commands::get_preferences,
            commands::update_preference,
            commands::get_saved_searches,
            commands::add_saved_search,
            commands::get_github_token,
            commands::set_github_token,
            commands::get_collection_counts,
            commands::scan_now,
            commands::delete_saved_search,
            commands::delete_preference,
            commands::open_in_browser,
            commands::get_setting,
            commands::set_setting,
            commands::clear_skipped_repos,
            commands::clear_inbox_repos,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

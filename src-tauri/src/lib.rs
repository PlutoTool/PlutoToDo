use std::sync::Mutex;
use tauri::Manager;

pub mod models;
pub mod database;
pub mod commands;
pub mod utils;

use database::Database;
use commands::*;
use utils::window_state::setup_window_state_persistence;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get the app data directory
            let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
            
            // Initialize database
            let db_path = app_dir.join("pluto_todo.db");
            let database = Database::new(&db_path).expect("Failed to initialize database");
            
            // Store database in app state
            app.manage(Mutex::new(database));
            
            // Setup window state persistence
            if let Err(e) = setup_window_state_persistence(app) {
                eprintln!("Failed to setup window state persistence: {}", e);
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Task commands
            create_task,
            get_tasks,
            get_task_by_id,
            update_task,
            delete_task,
            delete_task_with_subtasks,
            delete_task_and_promote_subtasks,
            check_task_has_subtasks,
            toggle_task_completion,
            search_tasks,
            get_tasks_by_category,
            // New subtask commands
            get_subtasks,
            get_task_hierarchy,
            get_task_with_subtasks,
            calculate_task_progress,
            get_incomplete_subtasks,
            bulk_mark_subtasks_completed,
            // Bulk commands
            bulk_check_tasks_have_subtasks,
            bulk_delete_tasks_with_subtasks,
            bulk_delete_tasks_and_promote_subtasks,
            // Category commands
            create_category,
            get_categories,
            get_category_by_id,
            update_category,
            delete_category,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use std::sync::Mutex;
use tauri::Manager;

pub mod models;
pub mod database;
pub mod commands;
pub mod utils;

use database::Database;
use commands::*;

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
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Task commands
            create_task,
            get_tasks,
            get_task_by_id,
            update_task,
            delete_task,
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

use std::sync::Mutex;
use tauri::State;
use crate::database::{Database, TaskRepository};
use crate::models::{Task, CreateTaskRequest, UpdateTaskRequest, TaskFilter};
use chrono::DateTime;

#[tauri::command]
pub async fn create_task(
    db: State<'_, Mutex<Database>>,
    title: String,
    description: Option<String>,
    priority: Option<String>,
    due_date: Option<String>,
    category_id: Option<String>,
    tags: Option<Vec<String>>,
    parent_id: Option<String>,
) -> Result<Task, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    let request = CreateTaskRequest {
        title,
        description,
        priority: priority.map(|p| crate::models::Priority::from_string(&p)),
        due_date: due_date.and_then(|d| {
            DateTime::parse_from_rfc3339(&d)
                .or_else(|_| {
                    // Try parsing as date only (YYYY-MM-DD)
                    let datetime_str = format!("{}T00:00:00Z", d);
                    DateTime::parse_from_rfc3339(&datetime_str)
                })
                .ok()
                .map(|dt| dt.naive_utc())
        }),
        category_id,
        tags,
        parent_id,
    };
    
    let task = Task::new(request);
    task_repo.create(&task).map_err(|e| format!("Failed to create task: {}", e))?;
    
    Ok(task)
}

#[tauri::command]
pub async fn get_tasks(
    db: State<'_, Mutex<Database>>,
    filter: Option<TaskFilter>,
) -> Result<Vec<Task>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    task_repo.get_all(filter).map_err(|e| format!("Failed to get tasks: {}", e))
}

#[tauri::command]
pub async fn get_task_by_id(
    db: State<'_, Mutex<Database>>,
    id: String,
) -> Result<Option<Task>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    task_repo.get_by_id(&id).map_err(|e| format!("Failed to get task: {}", e))
}

#[tauri::command]
pub async fn update_task(
    db: State<'_, Mutex<Database>>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    completed: Option<bool>,
    priority: Option<String>,
    due_date: Option<String>,
    category_id: Option<String>,
    tags: Option<Vec<String>>,
    parent_id: Option<String>,
) -> Result<Task, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    let mut task = task_repo
        .get_by_id(&id)
        .map_err(|e| format!("Failed to get task: {}", e))?
        .ok_or_else(|| "Task not found".to_string())?;
    
    let request = UpdateTaskRequest {
        title,
        description,
        completed,
        priority: priority.map(|p| crate::models::Priority::from_string(&p)),
        due_date: due_date.and_then(|d| {
            DateTime::parse_from_rfc3339(&d)
                .or_else(|_| {
                    // Try parsing as date only (YYYY-MM-DD)
                    let datetime_str = format!("{}T00:00:00Z", d);
                    DateTime::parse_from_rfc3339(&datetime_str)
                })
                .ok()
                .map(|dt| dt.naive_utc())
        }),
        category_id,
        tags,
        parent_id,
    };
    
    task.update(request);
    task_repo.update(&task).map_err(|e| format!("Failed to update task: {}", e))?;
    
    Ok(task)
}

#[tauri::command]
pub async fn delete_task(
    db: State<'_, Mutex<Database>>,
    id: String,
) -> Result<(), String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    task_repo.delete(&id).map_err(|e| format!("Failed to delete task: {}", e))
}

#[tauri::command]
pub async fn toggle_task_completion(
    db: State<'_, Mutex<Database>>,
    id: String,
) -> Result<Task, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    let mut task = task_repo
        .get_by_id(&id)
        .map_err(|e| format!("Failed to get task: {}", e))?
        .ok_or_else(|| "Task not found".to_string())?;
    
    task.completed = !task.completed;
    task.updated_at = chrono::Utc::now().naive_utc();
    
    task_repo.update(&task).map_err(|e| format!("Failed to toggle task: {}", e))?;
    
    Ok(task)
}

#[tauri::command]
pub async fn search_tasks(
    db: State<'_, Mutex<Database>>,
    query: String,
) -> Result<Vec<Task>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    let filter = TaskFilter {
        completed: None,
        priority: None,
        category_id: None,
        parent_id: None,
        search_query: Some(query),
        due_before: None,
        due_after: None,
        no_category: None,
    };
    
    task_repo.get_all(Some(filter)).map_err(|e| format!("Failed to search tasks: {}", e))
}

#[tauri::command]
pub async fn get_tasks_by_category(
    db: State<'_, Mutex<Database>>,
    category_id: String,
) -> Result<Vec<Task>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    let filter = TaskFilter {
        completed: None,
        priority: None,
        category_id: Some(category_id),
        parent_id: None,
        search_query: None,
        due_before: None,
        due_after: None,
        no_category: None,
    };
    
    task_repo.get_all(Some(filter)).map_err(|e| format!("Failed to get tasks by category: {}", e))
}

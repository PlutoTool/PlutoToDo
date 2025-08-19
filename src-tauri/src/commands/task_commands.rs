use std::sync::Mutex;
use tauri::State;
use crate::database::{Database, TaskRepository};
use crate::models::{Task, CreateTaskRequest, UpdateTaskRequest, TaskFilter};

// Task command handlers for the Tauri application

#[tauri::command]
pub async fn create_task(
    db: State<'_, Mutex<Database>>,
    request: CreateTaskRequest,
) -> Result<Task, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
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
    request: UpdateTaskRequest,
) -> Result<Task, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    let mut task = task_repo
        .get_by_id(&id)
        .map_err(|e| format!("Failed to get task: {}", e))?
        .ok_or_else(|| "Task not found".to_string())?;
    
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
pub async fn delete_task_with_subtasks(
    db: State<'_, Mutex<Database>>,
    id: String,
) -> Result<(), String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    task_repo.delete_task_and_subtasks(&id).map_err(|e| format!("Failed to delete task with subtasks: {}", e))
}

#[tauri::command]
pub async fn delete_task_and_promote_subtasks(
    db: State<'_, Mutex<Database>>,
    id: String,
) -> Result<(), String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    task_repo.delete_task_and_promote_subtasks(&id).map_err(|e| format!("Failed to delete task and promote subtasks: {}", e))
}

#[tauri::command]
pub async fn check_task_has_subtasks(
    db: State<'_, Mutex<Database>>,
    id: String,
) -> Result<bool, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    task_repo.has_subtasks(&id).map_err(|e| format!("Failed to check subtasks: {}", e))
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

#[tauri::command]
#[allow(non_snake_case)]
pub async fn get_subtasks(
    db: State<'_, Mutex<Database>>,
    parentId: String,
) -> Result<Vec<Task>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    let filter = TaskFilter {
        completed: None,
        priority: None,
        category_id: None,
        parent_id: Some(parentId),
        search_query: None,
        due_before: None,
        due_after: None,
        no_category: None,
    };
    
    task_repo.get_all(Some(filter)).map_err(|e| format!("Failed to get subtasks: {}", e))
}

#[tauri::command]
pub async fn get_task_hierarchy(
    db: State<'_, Mutex<Database>>,
    root_id: Option<String>,
) -> Result<Vec<Task>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    task_repo.get_task_hierarchy(root_id).map_err(|e| format!("Failed to get task hierarchy: {}", e))
}

#[tauri::command]
pub async fn get_task_with_subtasks(
    db: State<'_, Mutex<Database>>,
    id: String,
) -> Result<Vec<Task>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    // Get the main task
    let main_task = task_repo
        .get_by_id(&id)
        .map_err(|e| format!("Failed to get task: {}", e))?
        .ok_or_else(|| "Task not found".to_string())?;
    
    // Get all subtasks recursively
    let subtasks = task_repo.get_task_hierarchy(Some(id))
        .map_err(|e| format!("Failed to get subtasks: {}", e))?;
    
    let mut all_tasks = vec![main_task];
    all_tasks.extend(subtasks);
    
    Ok(all_tasks)
}

#[tauri::command]
pub async fn calculate_task_progress(
    db: State<'_, Mutex<Database>>,
    id: String,
) -> Result<TaskProgress, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    task_repo.calculate_task_progress(&id).map_err(|e| format!("Failed to calculate progress: {}", e))
}

#[tauri::command]
#[allow(non_snake_case)]
pub async fn get_incomplete_subtasks(
    db: State<'_, Mutex<Database>>,
    parentId: String,
) -> Result<Vec<Task>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    // Get all subtasks recursively
    let all_subtasks = task_repo.get_task_hierarchy(Some(parentId))
        .map_err(|e| format!("Failed to get task hierarchy: {}", e))?;
    
    // Filter for incomplete tasks only
    let incomplete_subtasks: Vec<Task> = all_subtasks
        .into_iter()
        .filter(|task| !task.completed)
        .collect();
    
    Ok(incomplete_subtasks)
}

#[tauri::command]
#[allow(non_snake_case)]
pub async fn bulk_mark_subtasks_completed(
    db: State<'_, Mutex<Database>>,
    parentId: String,
) -> Result<Vec<Task>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    // Get all incomplete subtasks
    let all_subtasks = task_repo.get_task_hierarchy(Some(parentId))
        .map_err(|e| format!("Failed to get task hierarchy: {}", e))?;
    
    let mut updated_tasks = Vec::new();
    
    // Mark all incomplete subtasks as completed
    for mut task in all_subtasks {
        if !task.completed {
            task.completed = true;
            task.updated_at = chrono::Utc::now().naive_utc();
            
            task_repo.update(&task)
                .map_err(|e| format!("Failed to update task {}: {}", task.id, e))?;
            
            updated_tasks.push(task);
        }
    }
    
    Ok(updated_tasks)
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct TaskProgress {
    pub total_subtasks: i32,
    pub completed_subtasks: i32,
    pub progress_percentage: f32,
    pub has_subtasks: bool,
}

#[tauri::command]
pub async fn bulk_check_tasks_have_subtasks(
    db: State<'_, Mutex<Database>>,
    ids: Vec<String>,
) -> Result<Vec<String>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    let mut tasks_with_subtasks = Vec::new();
    
    for id in ids {
        if task_repo.has_subtasks(&id).map_err(|e| format!("Failed to check subtasks: {}", e))? {
            tasks_with_subtasks.push(id);
        }
    }
    
    Ok(tasks_with_subtasks)
}

#[tauri::command]
pub async fn bulk_delete_tasks_with_subtasks(
    db: State<'_, Mutex<Database>>,
    ids: Vec<String>,
) -> Result<(), String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    for id in ids {
        task_repo.delete_task_and_subtasks(&id).map_err(|e| format!("Failed to delete task with subtasks: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn bulk_delete_tasks_and_promote_subtasks(
    db: State<'_, Mutex<Database>>,
    ids: Vec<String>,
) -> Result<(), String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let task_repo = TaskRepository::new(&db_lock.connection);
    
    for id in ids {
        task_repo.delete_task_and_promote_subtasks(&id).map_err(|e| format!("Failed to delete task and promote subtasks: {}", e))?;
    }
    
    Ok(())
}

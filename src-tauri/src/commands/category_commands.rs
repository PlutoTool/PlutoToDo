use std::sync::Mutex;
use tauri::State;
use crate::database::{Database, CategoryRepository};
use crate::models::{Category, CreateCategoryRequest, UpdateCategoryRequest};

#[tauri::command]
pub async fn create_category(
    db: State<'_, Mutex<Database>>,
    name: String,
    color: String,
    icon: Option<String>,
) -> Result<Category, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let category_repo = CategoryRepository::new(&db_lock.connection);
    
    let request = CreateCategoryRequest { name, color, icon };
    let category = Category::new(request);
    category_repo.create(&category).map_err(|e| format!("Failed to create category: {}", e))?;
    
    Ok(category)
}

#[tauri::command]
pub async fn get_categories(
    db: State<'_, Mutex<Database>>,
) -> Result<Vec<Category>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let category_repo = CategoryRepository::new(&db_lock.connection);
    
    category_repo.get_all().map_err(|e| format!("Failed to get categories: {}", e))
}

#[tauri::command]
pub async fn get_category_by_id(
    db: State<'_, Mutex<Database>>,
    id: String,
) -> Result<Option<Category>, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let category_repo = CategoryRepository::new(&db_lock.connection);
    
    category_repo.get_by_id(&id).map_err(|e| format!("Failed to get category: {}", e))
}

#[tauri::command]
pub async fn update_category(
    db: State<'_, Mutex<Database>>,
    id: String,
    name: Option<String>,
    color: Option<String>,
    icon: Option<String>,
) -> Result<Category, String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let category_repo = CategoryRepository::new(&db_lock.connection);
    
    let mut category = category_repo
        .get_by_id(&id)
        .map_err(|e| format!("Failed to get category: {}", e))?
        .ok_or_else(|| "Category not found".to_string())?;
    
    let request = UpdateCategoryRequest { name, color, icon };
    category.update(request);
    category_repo.update(&category).map_err(|e| format!("Failed to update category: {}", e))?;
    
    Ok(category)
}

#[tauri::command]
pub async fn delete_category(
    db: State<'_, Mutex<Database>>,
    id: String,
) -> Result<(), String> {
    let db_lock = db.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let category_repo = CategoryRepository::new(&db_lock.connection);
    
    category_repo.delete(&id).map_err(|e| format!("Failed to delete category: {}", e))
}

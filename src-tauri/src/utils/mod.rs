use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Task not found")]
    TaskNotFound,
    
    #[error("Category not found")]
    CategoryNotFound,
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

impl From<AppError> for String {
    fn from(error: AppError) -> Self {
        error.to_string()
    }
}

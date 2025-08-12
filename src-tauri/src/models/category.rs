use chrono::{NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub color: String,
    pub icon: Option<String>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub color: String,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCategoryRequest {
    pub name: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

impl Category {
    pub fn new(request: CreateCategoryRequest) -> Self {
        Category {
            id: uuid::Uuid::new_v4().to_string(),
            name: request.name,
            color: request.color,
            icon: request.icon,
            created_at: Utc::now().naive_utc(),
        }
    }

    pub fn update(&mut self, request: UpdateCategoryRequest) {
        if let Some(name) = request.name {
            self.name = name;
        }
        if let Some(color) = request.color {
            self.color = color;
        }
        if let Some(icon) = request.icon {
            self.icon = Some(icon);
        }
    }
}

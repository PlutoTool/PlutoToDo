use chrono::{NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
    pub priority: Priority,
    pub due_date: Option<NaiveDateTime>,
    pub category_id: Option<String>,
    pub tags: Vec<String>,
    pub parent_id: Option<String>, // For subtasks
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum Priority {
    Low,
    Medium,
    High,
}

impl Default for Priority {
    fn default() -> Self {
        Priority::Medium
    }
}

impl ToString for Priority {
    fn to_string(&self) -> String {
        match self {
            Priority::Low => "Low".to_string(),
            Priority::Medium => "Medium".to_string(),
            Priority::High => "High".to_string(),
        }
    }
}

impl Priority {
    pub fn from_string(s: &str) -> Self {
        match s {
            "Low" => Priority::Low,
            "High" => Priority::High,
            _ => Priority::Medium,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTaskRequest {
    pub title: String,
    pub description: Option<String>,
    pub priority: Option<String>,  // Changed to String for easier parsing
    pub due_date: Option<String>,  // Changed to String for JSON serialization
    pub category_id: Option<String>,
    pub tags: Option<Vec<String>>,
    pub parent_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTaskRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub completed: Option<bool>,
    pub priority: Option<Priority>,
    pub due_date: Option<NaiveDateTime>,
    pub category_id: Option<String>,
    pub tags: Option<Vec<String>>,
    pub parent_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskFilter {
    pub completed: Option<bool>,
    pub priority: Option<Priority>,
    pub category_id: Option<String>,
    pub parent_id: Option<String>,
    pub search_query: Option<String>,
    pub due_before: Option<String>, // Accept as string and parse later
    pub due_after: Option<String>,  // Accept as string and parse later
    pub no_category: Option<bool>, // true means filter for tasks with no category
}

impl TaskFilter {
    pub fn parse_due_before(&self) -> Option<NaiveDateTime> {
        self.due_before.as_ref().and_then(|d| {
            if d.is_empty() {
                return None;
            }
            
            use chrono::DateTime;
            
            // Try parsing as full ISO 8601 datetime
            DateTime::parse_from_rfc3339(d)
                .or_else(|_| {
                    // Try parsing as date only (YYYY-MM-DD) and add time
                    let datetime_str = format!("{}T23:59:59Z", d);
                    DateTime::parse_from_rfc3339(&datetime_str)
                })
                .ok()
                .map(|dt| dt.naive_utc())
        })
    }

    pub fn parse_due_after(&self) -> Option<NaiveDateTime> {
        self.due_after.as_ref().and_then(|d| {
            if d.is_empty() {
                return None;
            }
            
            use chrono::DateTime;
            
            // Try parsing as full ISO 8601 datetime
            DateTime::parse_from_rfc3339(d)
                .or_else(|_| {
                    // Try parsing as date only (YYYY-MM-DD) and add time
                    let datetime_str = format!("{}T00:00:00Z", d);
                    DateTime::parse_from_rfc3339(&datetime_str)
                })
                .ok()
                .map(|dt| dt.naive_utc())
        })
    }
}

impl Task {
    pub fn new(request: CreateTaskRequest) -> Self {
        let now = Utc::now().naive_utc();
        
        // Parse due_date from string
        let parsed_due_date = request.due_date.and_then(|d| {
            if d.is_empty() {
                return None;
            }
            
            use chrono::DateTime;
            
            DateTime::parse_from_rfc3339(&d)
                .or_else(|_| {
                    // Try parsing as date only (YYYY-MM-DD)
                    let datetime_str = format!("{}T00:00:00Z", d);
                    DateTime::parse_from_rfc3339(&datetime_str)
                })
                .ok()
                .map(|dt| dt.naive_utc())
        });
        
        Task {
            id: uuid::Uuid::new_v4().to_string(),
            title: request.title,
            description: request.description,
            completed: false,
            priority: request.priority.map(|p| Priority::from_string(&p)).unwrap_or_default(),
            due_date: parsed_due_date,
            category_id: request.category_id,
            tags: request.tags.unwrap_or_default(),
            parent_id: request.parent_id,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn update(&mut self, request: UpdateTaskRequest) {
        if let Some(title) = request.title {
            self.title = title;
        }
        if let Some(description) = request.description {
            self.description = Some(description);
        }
        if let Some(completed) = request.completed {
            self.completed = completed;
        }
        if let Some(priority) = request.priority {
            self.priority = priority;
        }
        if let Some(due_date) = request.due_date {
            self.due_date = Some(due_date);
        }
        if let Some(category_id) = request.category_id {
            self.category_id = Some(category_id);
        }
        if let Some(tags) = request.tags {
            self.tags = tags;
        }
        if let Some(parent_id) = request.parent_id {
            self.parent_id = Some(parent_id);
        }
        
        self.updated_at = Utc::now().naive_utc();
    }
}

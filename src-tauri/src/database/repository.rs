use rusqlite::{params, Connection, Result};
use crate::models::{Task, Category, Priority, TaskFilter};

pub struct TaskRepository<'a> {
    conn: &'a Connection,
}

impl<'a> TaskRepository<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn create(&self, task: &Task) -> Result<()> {
        self.conn.execute(
            "INSERT INTO tasks (id, title, description, completed, priority, due_date, category_id, parent_id, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                task.id,
                task.title,
                task.description,
                task.completed,
                task.priority.to_string(),
                task.due_date,
                task.category_id,
                task.parent_id,
                task.created_at,
                task.updated_at,
            ],
        )?;

        // Insert tags
        for tag in &task.tags {
            self.conn.execute(
                "INSERT INTO task_tags (task_id, tag) VALUES (?1, ?2)",
                params![task.id, tag],
            )?;
        }

        Ok(())
    }

    pub fn get_by_id(&self, id: &str) -> Result<Option<Task>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, description, completed, priority, due_date, category_id, parent_id, created_at, updated_at
             FROM tasks WHERE id = ?1",
        )?;

        let task_result = stmt.query_row(params![id], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                completed: row.get(3)?,
                priority: Priority::from_string(&row.get::<_, String>(4)?),
                due_date: row.get(5)?,
                category_id: row.get(6)?,
                parent_id: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
                tags: vec![], // Will be populated below
            })
        });

        match task_result {
            Ok(mut task) => {
                // Get tags
                task.tags = self.get_task_tags(&task.id)?;
                Ok(Some(task))
            }
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn get_all(&self, filter: Option<TaskFilter>) -> Result<Vec<Task>> {
        let mut query = "SELECT id, title, description, completed, priority, due_date, category_id, parent_id, created_at, updated_at FROM tasks".to_string();
        let mut conditions = Vec::new();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(ref f) = filter {
            if let Some(completed) = f.completed {
                conditions.push("completed = ?".to_string());
                params.push(Box::new(completed));
            }
            if let Some(ref priority) = f.priority {
                conditions.push("priority = ?".to_string());
                params.push(Box::new(priority.to_string()));
            }
            if let Some(ref category_id) = f.category_id {
                conditions.push("category_id = ?".to_string());
                params.push(Box::new(category_id.clone()));
            }
            if let Some(no_category) = f.no_category {
                if no_category {
                    conditions.push("category_id IS NULL".to_string());
                }
            }
            if let Some(ref parent_id) = f.parent_id {
                conditions.push("parent_id = ?".to_string());
                params.push(Box::new(parent_id.clone()));
            }
            if let Some(ref search_query) = f.search_query {
                conditions.push("(title LIKE ? OR description LIKE ?)".to_string());
                let search_pattern = format!("%{}%", search_query);
                params.push(Box::new(search_pattern.clone()));
                params.push(Box::new(search_pattern));
            }
            if let Some(due_before) = f.parse_due_before() {
                conditions.push("due_date <= ?".to_string());
                params.push(Box::new(due_before));
            }
            if let Some(due_after) = f.parse_due_after() {
                conditions.push("due_date >= ?".to_string());
                params.push(Box::new(due_after));
            }
        }

        if !conditions.is_empty() {
            query.push_str(" WHERE ");
            query.push_str(&conditions.join(" AND "));
        }

        query.push_str(" ORDER BY created_at DESC");

        let mut stmt = self.conn.prepare(&query)?;
        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();

        let task_iter = stmt.query_map(&param_refs[..], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                completed: row.get(3)?,
                priority: Priority::from_string(&row.get::<_, String>(4)?),
                due_date: row.get(5)?,
                category_id: row.get(6)?,
                parent_id: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
                tags: vec![], // Will be populated below
            })
        })?;

        let mut tasks = Vec::new();
        for task_result in task_iter {
            let mut task = task_result?;
            task.tags = self.get_task_tags(&task.id)?;
            tasks.push(task);
        }

        Ok(tasks)
    }

    pub fn update(&self, task: &Task) -> Result<()> {
        self.conn.execute(
            "UPDATE tasks SET title = ?1, description = ?2, completed = ?3, priority = ?4, 
             due_date = ?5, category_id = ?6, parent_id = ?7, updated_at = ?8 WHERE id = ?9",
            params![
                task.title,
                task.description,
                task.completed,
                task.priority.to_string(),
                task.due_date,
                task.category_id,
                task.parent_id,
                task.updated_at,
                task.id,
            ],
        )?;

        // Update tags
        self.conn.execute("DELETE FROM task_tags WHERE task_id = ?1", params![task.id])?;
        for tag in &task.tags {
            self.conn.execute(
                "INSERT INTO task_tags (task_id, tag) VALUES (?1, ?2)",
                params![task.id, tag],
            )?;
        }

        Ok(())
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM tasks WHERE id = ?1", params![id])?;
        Ok(())
    }

    fn get_task_tags(&self, task_id: &str) -> Result<Vec<String>> {
        let mut stmt = self.conn.prepare("SELECT tag FROM task_tags WHERE task_id = ?1")?;
        let tag_iter = stmt.query_map(params![task_id], |row| {
            Ok(row.get::<_, String>(0)?)
        })?;

        let mut tags = Vec::new();
        for tag_result in tag_iter {
            tags.push(tag_result?);
        }
        Ok(tags)
    }

    pub fn get_task_hierarchy(&self, root_id: Option<String>) -> Result<Vec<Task>> {
        let mut tasks = Vec::new();
        let mut ids_to_process = Vec::new();

        // Start with direct children of root_id (or root tasks if None)
        let filter = TaskFilter {
            completed: None,
            priority: None,
            category_id: None,
            parent_id: root_id.clone(),
            search_query: None,
            due_before: None,
            due_after: None,
            no_category: None,
        };

        let direct_children = self.get_all(Some(filter))?;
        
        for child in direct_children {
            ids_to_process.push(child.id.clone());
            tasks.push(child);
        }

        // Recursively get all descendants
        while let Some(current_id) = ids_to_process.pop() {
            let filter = TaskFilter {
                completed: None,
                priority: None,
                category_id: None,
                parent_id: Some(current_id),
                search_query: None,
                due_before: None,
                due_after: None,
                no_category: None,
            };

            let children = self.get_all(Some(filter))?;
            for child in children {
                ids_to_process.push(child.id.clone());
                tasks.push(child);
            }
        }

        Ok(tasks)
    }

    pub fn calculate_task_progress(&self, task_id: &str) -> Result<crate::commands::task_commands::TaskProgress> {
        // Get all subtasks recursively
        let subtasks = self.get_task_hierarchy(Some(task_id.to_string()))?;
        
        if subtasks.is_empty() {
            return Ok(crate::commands::task_commands::TaskProgress {
                total_subtasks: 0,
                completed_subtasks: 0,
                progress_percentage: 0.0,
                has_subtasks: false,
            });
        }

        let total_subtasks = subtasks.len() as i32;
        let completed_subtasks = subtasks.iter().filter(|t| t.completed).count() as i32;
        let progress_percentage = if total_subtasks > 0 {
            (completed_subtasks as f32 / total_subtasks as f32) * 100.0
        } else {
            0.0
        };

        Ok(crate::commands::task_commands::TaskProgress {
            total_subtasks,
            completed_subtasks,
            progress_percentage,
            has_subtasks: true,
        })
    }

    pub fn delete_task_and_subtasks(&self, task_id: &str) -> Result<()> {
        // Get all subtasks recursively
        let subtasks = self.get_task_hierarchy(Some(task_id.to_string()))?;
        
        // Delete all subtasks first
        for subtask in subtasks {
            self.delete(&subtask.id)?;
        }
        
        // Delete the main task
        self.delete(task_id)?;
        
        Ok(())
    }

    pub fn delete_task_and_promote_subtasks(&self, task_id: &str) -> Result<()> {
        // Get the task to be deleted
        let task = self.get_by_id(task_id)?
            .ok_or_else(|| rusqlite::Error::QueryReturnedNoRows)?;
        
        // Get direct subtasks (only immediate children)
        let direct_subtasks = self.get_direct_subtasks(task_id)?;
        
        // Update all direct subtasks to have the same parent as the task being deleted
        for mut subtask in direct_subtasks {
            subtask.parent_id = task.parent_id.clone();
            subtask.updated_at = chrono::Utc::now().naive_utc();
            self.update(&subtask)?;
        }
        
        // Now delete the task (it should have no children anymore)
        self.delete(task_id)?;
        
        Ok(())
    }

    pub fn get_direct_subtasks(&self, parent_id: &str) -> Result<Vec<Task>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, description, completed, priority, due_date, category_id, parent_id, created_at, updated_at
             FROM tasks WHERE parent_id = ?1 ORDER BY created_at ASC",
        )?;

        let task_iter = stmt.query_map(params![parent_id], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                completed: row.get(3)?,
                priority: Priority::from_string(&row.get::<_, String>(4)?),
                due_date: row.get(5)?,
                category_id: row.get(6)?,
                parent_id: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
                tags: vec![], // Will be populated below
            })
        })?;

        let mut tasks = Vec::new();
        for task_result in task_iter {
            let mut task = task_result?;
            task.tags = self.get_task_tags(&task.id)?;
            tasks.push(task);
        }

        Ok(tasks)
    }

    pub fn has_subtasks(&self, task_id: &str) -> Result<bool> {
        let mut stmt = self.conn.prepare("SELECT COUNT(*) FROM tasks WHERE parent_id = ?1")?;
        let count: i64 = stmt.query_row(params![task_id], |row| row.get(0))?;
        Ok(count > 0)
    }

    pub fn get_root_tasks(&self) -> Result<Vec<Task>> {
        let _filter = TaskFilter {
            completed: None,
            priority: None,
            category_id: None,
            parent_id: Some("NULL".to_string()), // Special case for root tasks
            search_query: None,
            due_before: None,
            due_after: None,
            no_category: None,
        };

        // Override the filter to get tasks with NULL parent_id
        let query = "SELECT id, title, description, completed, priority, due_date, category_id, parent_id, created_at, updated_at FROM tasks WHERE parent_id IS NULL ORDER BY created_at DESC".to_string();
        
        let mut stmt = self.conn.prepare(&query)?;
        let task_iter = stmt.query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                completed: row.get(3)?,
                priority: Priority::from_string(&row.get::<_, String>(4)?),
                due_date: row.get(5)?,
                category_id: row.get(6)?,
                parent_id: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
                tags: vec![], // Will be populated below
            })
        })?;

        let mut tasks = Vec::new();
        for task_result in task_iter {
            let mut task = task_result?;
            task.tags = self.get_task_tags(&task.id)?;
            tasks.push(task);
        }

        Ok(tasks)
    }
}

pub struct CategoryRepository<'a> {
    conn: &'a Connection,
}

impl<'a> CategoryRepository<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn create(&self, category: &Category) -> Result<()> {
        self.conn.execute(
            "INSERT INTO categories (id, name, color, icon, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![category.id, category.name, category.color, category.icon, category.created_at],
        )?;
        Ok(())
    }

    pub fn get_by_id(&self, id: &str) -> Result<Option<Category>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, color, icon, created_at FROM categories WHERE id = ?1",
        )?;

        let category_result = stmt.query_row(params![id], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                icon: row.get(3)?,
                created_at: row.get(4)?,
            })
        });

        match category_result {
            Ok(category) => Ok(Some(category)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn get_all(&self) -> Result<Vec<Category>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, color, icon, created_at FROM categories ORDER BY name ASC",
        )?;

        let category_iter = stmt.query_map([], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                icon: row.get(3)?,
                created_at: row.get(4)?,
            })
        })?;

        let mut categories = Vec::new();
        for category_result in category_iter {
            categories.push(category_result?);
        }
        Ok(categories)
    }

    pub fn update(&self, category: &Category) -> Result<()> {
        self.conn.execute(
            "UPDATE categories SET name = ?1, color = ?2, icon = ?3 WHERE id = ?4",
            params![category.name, category.color, category.icon, category.id],
        )?;
        Ok(())
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM categories WHERE id = ?1", params![id])?;
        Ok(())
    }
}

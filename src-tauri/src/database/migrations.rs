use rusqlite::{Connection, Result};

pub fn run_migrations(conn: &Connection) -> Result<()> {
    // Create categories table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            icon TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Create tasks table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT FALSE,
            priority TEXT DEFAULT 'Medium',
            due_date DATETIME,
            category_id TEXT,
            parent_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id),
            FOREIGN KEY (parent_id) REFERENCES tasks(id)
        )",
        [],
    )?;

    // Create task_tags table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS task_tags (
            task_id TEXT,
            tag TEXT,
            PRIMARY KEY (task_id, tag),
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Create indexes for better performance
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category_id)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_id)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON task_tags(tag)",
        [],
    )?;

    // Clean up duplicate categories first (keep the oldest one for each name)
    conn.execute(
        "DELETE FROM categories WHERE id NOT IN (
            SELECT MIN(id) FROM categories GROUP BY name
        )",
        [],
    )?;

    // Insert default categories
    let default_categories = vec![
        ("Personal", "#3B82F6", "User"),
        ("Work", "#EF4444", "Briefcase"),
        ("Shopping", "#10B981", "ShoppingCart"),
        ("Health", "#F59E0B", "Heart"),
    ];

    for (name, color, icon) in default_categories {
        // Check if category already exists
        let exists: i64 = conn.query_row(
            "SELECT COUNT(*) FROM categories WHERE name = ?",
            [name],
            |row| row.get(0)
        ).unwrap_or(0);

        if exists == 0 {
            conn.execute(
                "INSERT INTO categories (id, name, color, icon) VALUES (?, ?, ?, ?)",
                [
                    &uuid::Uuid::new_v4().to_string(),
                    name,
                    color,
                    icon,
                ],
            )?;
        }
    }

    Ok(())
}

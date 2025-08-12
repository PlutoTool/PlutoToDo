use rusqlite::{Connection, Result};
use std::path::Path;
use crate::database::migrations::run_migrations;

pub struct Database {
    pub connection: Connection,
}

impl Database {
    pub fn new(db_path: &Path) -> Result<Self> {
        let connection = Connection::open(db_path)?;
        
        // Enable foreign keys
        connection.execute("PRAGMA foreign_keys = ON", [])?;
        
        let db = Database { connection };
        
        // Run migrations
        run_migrations(&db.connection)?;
        
        Ok(db)
    }

    pub fn in_memory() -> Result<Self> {
        let connection = Connection::open_in_memory()?;
        connection.execute("PRAGMA foreign_keys = ON", [])?;
        
        let db = Database { connection };
        run_migrations(&db.connection)?;
        
        Ok(db)
    }
}

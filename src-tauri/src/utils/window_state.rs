use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{LogicalSize, Manager, PhysicalPosition, WebviewWindow};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WindowState {
    pub width: f64,
    pub height: f64,
    pub x: i32,
    pub y: i32,
    pub maximized: bool,
    // Store the normal (non-maximized) size separately
    pub normal_width: f64,
    pub normal_height: f64,
    pub normal_x: i32,
    pub normal_y: i32,
}

impl Default for WindowState {
    fn default() -> Self {
        Self {
            width: 900.0,
            height: 700.0,
            x: 100,
            y: 100,
            maximized: false,
            normal_width: 900.0,
            normal_height: 700.0,
            normal_x: 100,
            normal_y: 100,
        }
    }
}

impl WindowState {
    /// Validate and constrain window state to screen bounds
    pub fn constrain_to_screen(&mut self) {
        // Get reasonable minimum and maximum sizes
        let min_width = 400.0;
        let min_height = 300.0;
        let max_width = 2560.0; // Reasonable max for most screens
        let max_height = 1440.0;
        
        // Constrain size
        self.width = self.width.clamp(min_width, max_width);
        self.height = self.height.clamp(min_height, max_height);
        self.normal_width = self.normal_width.clamp(min_width, max_width);
        self.normal_height = self.normal_height.clamp(min_height, max_height);
        
        // Constrain position (ensure window is not completely off-screen)
        self.x = self.x.clamp(-100, 2560); // Allow some off-screen but not completely
        self.y = self.y.clamp(0, 1440);    // Don't allow negative Y (above screen)
        self.normal_x = self.normal_x.clamp(-100, 2560);
        self.normal_y = self.normal_y.clamp(0, 1440);
    }

    /// Save window state to file
    pub fn save(&self, path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(self)?;
        fs::write(path, json)?;
        Ok(())
    }

    /// Load window state from file
    pub fn load(path: &PathBuf) -> Result<Self, Box<dyn std::error::Error>> {
        if !path.exists() {
            return Ok(Self::default());
        }
        
        let json = fs::read_to_string(path)?;
        let mut state: WindowState = serde_json::from_str(&json)?;
        
        // Ensure the loaded state is within reasonable bounds
        state.constrain_to_screen();
        
        Ok(state)
    }

    /// Apply window state to a Tauri window
    pub fn apply_to_window(&self, window: &WebviewWindow) -> Result<(), Box<dyn std::error::Error>> {
        // Create a mutable copy to constrain bounds
        let mut state = self.clone();
        state.constrain_to_screen();
        
        if state.maximized {
            // If window was maximized, restore to normal size first, then maximize
            window.set_size(LogicalSize::new(state.normal_width, state.normal_height))?;
            window.set_position(PhysicalPosition::new(state.normal_x, state.normal_y))?;
            // Small delay to ensure the size is set before maximizing
            std::thread::sleep(std::time::Duration::from_millis(10));
            window.maximize()?;
        } else {
            // Apply normal window state
            window.set_size(LogicalSize::new(state.width, state.height))?;
            window.set_position(PhysicalPosition::new(state.x, state.y))?;
        }
        
        Ok(())
    }

    /// Get current window state from a Tauri window
    pub fn from_window(window: &WebviewWindow) -> Result<Self, Box<dyn std::error::Error>> {
        let size = window.outer_size()?;
        let position = window.outer_position()?;
        let maximized = window.is_maximized()?;
        
        Ok(Self {
            width: size.width as f64,
            height: size.height as f64,
            x: position.x,
            y: position.y,
            maximized,
            // For now, use current values as normal values - we'll improve this logic
            normal_width: if maximized { 900.0 } else { size.width as f64 },
            normal_height: if maximized { 700.0 } else { size.height as f64 },
            normal_x: if maximized { 100 } else { position.x },
            normal_y: if maximized { 100 } else { position.y },
        })
    }

    /// Update normal size when window is resized in non-maximized state
    pub fn update_normal_size(&mut self, window: &WebviewWindow) -> Result<(), Box<dyn std::error::Error>> {
        if !window.is_maximized()? {
            let size = window.outer_size()?;
            let position = window.outer_position()?;
            
            self.normal_width = size.width as f64;
            self.normal_height = size.height as f64;
            self.normal_x = position.x;
            self.normal_y = position.y;
            self.width = size.width as f64;
            self.height = size.height as f64;
            self.x = position.x;
            self.y = position.y;
        }
        
        self.maximized = window.is_maximized()?;
        Ok(())
    }
}

/// Setup window state persistence for the application
pub fn setup_window_state_persistence(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app.path().app_data_dir()?;
    let window_state_path = app_dir.join("window_state.json");
    
    // Load saved window state
    let window_state = WindowState::load(&window_state_path).unwrap_or_default();
    
    // Get the main window
    if let Some(main_window) = app.get_webview_window("main") {
        // Apply saved state to window
        window_state.apply_to_window(&main_window)?;
        
        // Setup event listeners to save state when window changes
        let state_path = window_state_path.clone();
        main_window.on_window_event({
            let window = main_window.clone();
            
            move |event| {
                match event {
                    tauri::WindowEvent::Resized(_) | 
                    tauri::WindowEvent::Moved(_) => {
                        if let Ok(mut current_state) = WindowState::from_window(&window) {
                            // Update normal size if not maximized
                            if let Ok(()) = current_state.update_normal_size(&window) {
                                current_state.constrain_to_screen();
                                if let Err(e) = current_state.save(&state_path) {
                                    eprintln!("Failed to save window state: {}", e);
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
        });
    }
    
    Ok(())
}

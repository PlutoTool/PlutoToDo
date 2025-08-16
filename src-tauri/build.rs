fn main() {
    // Add Windows-specific build configurations
    #[cfg(target_os = "windows")]
    {
        // Set application manifest for Windows
        if std::path::Path::new("Pluto-ToDo.exe.manifest").exists() {
            println!("cargo:rustc-link-arg-bin=pluto-todo=/MANIFEST:EMBED");
            println!("cargo:rustc-link-arg-bin=pluto-todo=/MANIFESTINPUT:Pluto-ToDo.exe.manifest");
        }
        
        // Set Windows subsystem to avoid console window
        println!("cargo:rustc-link-arg-bin=pluto-todo=/SUBSYSTEM:WINDOWS");
    }
    
    tauri_build::build()
}

use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_positioner::{Position, WindowExt};
use tauri_plugin_sql::{Migration, MigrationKind};  
use sqlx::{SqlitePool};
use tokio::runtime::Runtime;

mod commands;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![  
        Migration {  
            version: 1,  
            description: "create task table",  
            sql: "CREATE TABLE IF NOT EXISTS task (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                description TEXT NOT NULL,  
                scheduled_at TEXT NOT NULL DEFAULT (DATETIME('now')),
                resolved BOOLEAN NOT NULL DEFAULT 0        
            );",  
            kind: MigrationKind::Up,  
        }  
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:test.db", migrations)
                .build()
        )
        .plugin(tauri_plugin_shell::init())  
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| {
            {
                // DB 설정
                let app_handle = app.handle();
                let mut data_path = app_handle.path().app_data_dir().unwrap();
                data_path.push("test.db");
                let db_url = format!("sqlite://{}", data_path.display());
                let runtime = Runtime::new().expect("Failed to create Tokio runtime");
                let pool = runtime.block_on(async {
                    SqlitePool::connect(&db_url).await.expect("Failed to connect DB")
                });
                app.manage(pool);

                // Accessory 모드로 설정
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);

                // TrayIcon 설정
                TrayIconBuilder::new()
                    .on_tray_icon_event(|tray_handle, event| {
                        match event {
                            TrayIconEvent::Click {
                                button: MouseButton::Left,
                                button_state: MouseButtonState::Up,
                                ..
                            } => {
                                println!("Tray icon clicked");
                                if let Some(win) =
                                    tray_handle.app_handle().get_webview_window("main")
                                {
                                    if win.is_visible().unwrap_or(false) {
                                        let _ = win.hide();
                                    } else {
                                        // TODO: fullscreen 일 때 처리
                                        let _ =
                                            win.as_ref().window().move_window(Position::TopRight);
                                        let _ = win.show();
                                        let _ = win.set_focus();
                                    }
                                }
                            }
                            _ => {}
                        }
                    })
                    .icon(app.default_window_icon().unwrap().clone())
                    .build(app)?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Focused(focused) = event {
                if !*focused {
                    println!("Window unfocused");
                    let _ = window.hide();
                }
            };
            if let tauri::WindowEvent::Destroyed = event {
                println!("Window destroyed");
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![commands::get_tasks, greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

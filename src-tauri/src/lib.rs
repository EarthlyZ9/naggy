use log::debug;
use sqlx::SqlitePool;
use std::sync::Arc;
use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconEvent},
    Manager, RunEvent,
};
use tauri_plugin_positioner::{Position, WindowExt};
use tauri_plugin_sql::{Migration, MigrationKind};
use tokio::runtime::Runtime;

mod commands;
mod db;
mod scheduler;

#[cfg(debug_assertions)]
const DB_FILE_NAME: &str = "test.db";
#[cfg(not(debug_assertions))]
const DB_FILE_NAME: &str = "naggy.db";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create task table",
        sql: "CREATE TABLE IF NOT EXISTS task (  
                id INTEGER PRIMARY KEY AUTOINCREMENT,  
                description TEXT NOT NULL,  
                scheduled_at TEXT NOT NULL DEFAULT (DATETIME('now')),
                resolved BOOLEAN NOT NULL DEFAULT 0        
            );",
        kind: MigrationKind::Up,
    }];

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new()
            .level(log::LevelFilter::Info)
            // verbose logs only for the scheduler module
            .level_for("naggy_lib::scheduler", log::LevelFilter::Debug)
        .build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(&format!("sqlite:{}", DB_FILE_NAME), migrations)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            {
                // DB 설정
                let app_handle = app.handle();
                let mut path = app_handle.path().app_data_dir().unwrap();
                path.push(DB_FILE_NAME);

                let db_url = format!("sqlite://{}", path.display());
                let runtime = Runtime::new().expect("Failed to create Tokio runtime");
                let pool = runtime.block_on(async {
                    SqlitePool::connect(&db_url)
                        .await
                        .expect("Failed to connect DB")
                });

                // Start notification scheduler
                let scheduler =
                    scheduler::NotificationScheduler::new(pool.clone(), app_handle.clone());
                let scheduler = Arc::new(scheduler.start());

                app.manage(pool);
                app.manage(scheduler);

                // TrayIcon 설정
                tauri::tray::TrayIconBuilder::with_id("naggy-tray-icon")
                    .on_tray_icon_event(|tray_handle, event| {
                        tauri_plugin_positioner::on_tray_event(tray_handle.app_handle(), &event);
                    })
                    .icon(app.default_window_icon().unwrap().clone())
                    .build(app)?;

                // Accessory 모드로 설정
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Focused(focused) = event {
                if !*focused {
                    debug!("Window unfocused");
                    #[cfg(not(debug_assertions))]
                    {
                        let _ = window.hide();
                    }
                }
            };
            if let tauri::WindowEvent::Destroyed = event {
                debug!("Window destroyed");
                let _ = window.hide();
            }
        })
        .on_tray_icon_event(|tray_handle, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                position,
                ..
            } => {
                debug!("Tray icon clicked");
                if let Some(win) = tray_handle.app_handle().get_webview_window("main") {
                    if win.is_visible().unwrap_or(false) {
                        debug!("Hiding window");
                        let _ = win.hide();
                    } else {
                        let monitor = win.current_monitor().unwrap().unwrap();
                        let monitor_width = monitor.size().width as f64;
                        debug!("Monitor width: {}", monitor_width);
                        debug!("Tray position X: {:?}", position.x);

                        let available_width = monitor_width - position.x;
                        debug!("Available width: {}", available_width);

                        if available_width < 500.0 {
                            debug!("Not enough space to the right, moving to top right corner");
                            let _ = win.move_window_constrained(Position::TopRight);
                        } else {
                            debug!("Enough space to the right, moving to tray bottom center");
                            let _ = win.move_window_constrained(Position::TrayBottomCenter);
                        }

                        let _ = win.show();
                        let _ = win.set_focus();
                    }
                }
            }
            _ => {}
        });

    let app = builder
        .invoke_handler(tauri::generate_handler![
            commands::get_tasks,
            commands::add_task,
            commands::resolve_task,
            commands::remove_task,
            commands::update_task,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        match event {
            RunEvent::ExitRequested { api, code, .. } => {
                // Keep the event loop running even if all windows are closed
                // This allow us to catch tray icon events when there is no window
                // if we manually requested an exit (code is Some(_)) we will let it go through
                if code.is_none() {
                    api.prevent_exit();
                } else {
                    debug!("Exiting with code {}", code.unwrap());
                    debug!("Stopping background tasks...");

                    // Retrieve scheduler from state and stop it
                    if let Some(scheduler) =
                        app_handle.try_state::<Arc<scheduler::NotificationScheduler>>()
                    {
                        scheduler.stop();
                    }
                }
            }
            _ => (),
        }
    });
}

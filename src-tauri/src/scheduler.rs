use crate::db;
use chrono::{self, TimeZone};
use log::{debug, error};
use sqlx::SqlitePool;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

/// Check interval for pending notifications (in seconds)
const CHECK_INTERVAL_SECS: u64 = 10;

#[cfg(debug_assertions)]
const NAG_INTERVAL_SECS: u64 = 60; // 1 minute in debug mode

#[cfg(not(debug_assertions))]
const NAG_INTERVAL_SECS: u64 = 300; // 5 minutes in release mode

/// Notification scheduler that runs in a background thread
pub struct NotificationScheduler {
    pool: SqlitePool,
    app: AppHandle,
    is_running: Arc<Mutex<bool>>,
}

impl NotificationScheduler {
    pub fn new(pool: SqlitePool, app: AppHandle) -> Self {
        Self {
            pool,
            app,
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    /// Start the background notification scheduler
    /// Checks for pending notifications every 10 seconds
    /// Returns self so it can be stored as Tauri state
    pub fn start(self) -> Self {
        let is_running = Arc::clone(&self.is_running);
        let pool = self.pool.clone();
        let app = self.app.clone();

        *is_running.lock().unwrap() = true;

        thread::spawn(move || {
            loop {
                // Check if we should still be running
                if !*is_running.lock().unwrap() {
                    break;
                }
                debug!("NotificationScheduler: Checking for notifications...");
                // Check for tasks that need notifications
                if let Err(e) = check_and_notify_tasks(&pool, &app) {
                    error!("Error checking notifications: {}", e);
                }

                // Sleep before next check
                thread::sleep(Duration::from_secs(CHECK_INTERVAL_SECS));
            }
        });

        self
    }

    /// Stop the background scheduler
    #[allow(dead_code)]
    pub fn stop(&self) {
        *self.is_running.lock().unwrap() = false;
    }
}

/// Check for tasks that are due for notification and send them
async fn check_and_notify_tasks_async(pool: &SqlitePool, app: &AppHandle) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Get all unresolved tasks
    // 1. Get system time (timezone aware)
    let local_now = chrono::Local::now();
    // 2. Change the time to start of day (0 hour, 0 min, 0 sec)
    let local_datetime = local_now.date_naive().and_hms_opt(0, 0, 0).unwrap();
    // 3. Convert to UTC
    let today = chrono::Local.from_local_datetime(&local_datetime).unwrap().with_timezone(&chrono::Utc);
    let tasks = db::fetch_unresolved_tasks(&mut tx, today).await?;

    tx.commit().await.map_err(|e| e.to_string())?;

    let now = chrono::Utc::now();

    // Check each task to see if it's time to notify
    for task in tasks {
        let scheduled_time = chrono::DateTime::parse_from_rfc3339(&task.scheduled_at)
            .map_err(|e| format!("Failed to parse scheduled_at: {}", e))?
            .with_timezone(&chrono::Utc);

        // If the scheduled time is within the current check window, send notification
        if scheduled_time <= now {
            let check_window = chrono::Duration::seconds(CHECK_INTERVAL_SECS as i64);
            let nag_window = chrono::Duration::seconds(NAG_INTERVAL_SECS as i64);
            if scheduled_time >= now - check_window {
                // notify imminent task
                send_notification(app, &task, false)?;
            } else if now - scheduled_time >= nag_window {
                // notify overdue task - send notification at regular intervals
                let elapsed_seconds = (now - scheduled_time).num_seconds();
                if elapsed_seconds % (NAG_INTERVAL_SECS as i64) <= CHECK_INTERVAL_SECS as i64 {
                    send_notification(app, &task, true)?;
                }
            }
        }
    }

    Ok(())
}

/// Synchronous wrapper for the async function (runs in background thread)
fn check_and_notify_tasks(pool: &SqlitePool, app: &AppHandle) -> Result<(), String> {
    // Create a new Tokio runtime for this thread
    let rt = tokio::runtime::Runtime::new()
        .map_err(|e| format!("Failed to create Tokio runtime: {}", e))?;

    rt.block_on(check_and_notify_tasks_async(pool, app))
}

/// Send a notification for a task
fn send_notification(
    app: &AppHandle,
    task: &crate::commands::Task,
    nag: bool,
) -> Result<(), String> {
    let title = if nag {
        "😡 Nagging!"
    } else {
        "📣 Reminder"
    };

    app.notification()
        .builder()
        .title(title)
        .body(&task.description)
        .show()
        .map_err(|e| format!("Failed to send notification: {}", e))?;

    debug!(
        "Notification sent for task {} ({}) | title: {}",
        task.id,
        task.description,
        title
    );

    Ok(())
}

use std::time::Duration;

use serde::Serialize;
use sqlx::types::time::OffsetDateTime;
use sqlx::{Row, SqlitePool};
use tauri::AppHandle;
use tauri::State;
use tauri_plugin_notification::Schedule;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    id: i64,
    description: String,
    scheduled_at: String,
    resolved: bool,
}

#[tauri::command]
pub async fn get_tasks(pool: State<'_, SqlitePool>) -> Result<Vec<Task>, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let rows = sqlx::query(
        "SELECT id, description, scheduled_at, resolved FROM task WHERE resolved = 0 ORDER BY scheduled_at ASC",
    )
    .fetch_all(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    let tasks = rows
        .into_iter()
        .map(|row| Task {
            id: row.get("id"),
            description: row.get("description"),
            scheduled_at: row.get("scheduled_at"),
            resolved: row.get("resolved"),
        })
        .collect();

    println!("tasks: {:?}", tasks);
    Ok(tasks)
}

#[tauri::command]
pub fn reserve_notification(app: AppHandle) {
    println!("before show");
    // 예: 5초 후에 알림 보내기
    use tauri_plugin_notification::NotificationExt;
    let cloned_app = app.clone();

    // thread::spawn(move|| {
    //     thread::sleep(Duration::from_secs(5));
    //     let _ = cloned_app
    //         .notification()
    //         .builder()
    //         .title("예약 알림")
    //         .body("알림이 도착했습니다.")
    //         .show();
    // });
    let five_sec_after = OffsetDateTime::now_utc() + Duration::from_secs(5);
    let schedule = Schedule::At {
        date: five_sec_after,
        repeating: false,
        allow_while_idle: false,
    };

    let _ = cloned_app
        .notification()
        .builder()
        .title("예약 알림")
        .body("알림이 도착했습니다.")
        .schedule(schedule)
        .show()
        .expect("Failed to schedule notification");

    // let result = cloned_app
    //     .notification()
    //     .builder()
    //     .title("예약 알림")
    //     .body("알림이 도착했습니다.")
    //     .show();
    // println!("after show");
    // if let Err(e) = result {
    //     println!("Error showing notification: {}", e);
    // }

    // tokio::spawn(async move {
    //     tokio::time::sleep(std::time::Duration::from_millis(3000)).await;

    //     let _ = cloned_app
    //         .notification()
    //         .builder()
    //         .title("예약 알림")
    //         .body("알림이 도착했습니다.")
    //         .show();
    // });
}

#[tauri::command]
pub async fn add_task(
    pool: State<'_, SqlitePool>,
    description: String,
    scheduled_at: String,
) -> Result<Task, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let result = sqlx::query("INSERT INTO task (description, scheduled_at) VALUES (?, ?)")
        .bind(&description)
        .bind(&scheduled_at)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    let id = result.last_insert_rowid();

    let row = sqlx::query("SELECT id, description, scheduled_at, resolved FROM task WHERE id = ?")
        .bind(id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    let task = Task {
        id: row.get("id"),
        description: row.get("description"),
        scheduled_at: row.get("scheduled_at"),
        resolved: row.get("resolved"),
    };

    println!("Task added: {:?}", task);
    Ok(task)
}

#[tauri::command]
pub async fn resolve_task(pool: State<'_, SqlitePool>, id: i64) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let result = sqlx::query("UPDATE task SET resolved = 1 WHERE id = ?")
        .bind(&id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn remove_task(pool: State<'_, SqlitePool>, id: i64) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let result = sqlx::query("DELETE FROM task WHERE id = ?")
        .bind(&id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(())
}

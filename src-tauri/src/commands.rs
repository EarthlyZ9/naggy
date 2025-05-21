use sqlx::{SqlitePool, Row};
use tauri::State;
use serde::Serialize;

#[derive(Serialize)]
pub struct Task {
    id: i64,
    description: String,
    scheduled_at: Option<String>, // 또는 chrono::NaiveDateTime 등으로 바꿀 수 있음
    resolved: bool,
}

#[tauri::command]
pub async fn get_tasks(pool: State<'_, SqlitePool>) -> Result<Vec<Task>, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let rows = sqlx::query("SELECT id, description, scheduled_at, resolved FROM task WHERE resolved = 0")
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

    Ok(tasks)
}
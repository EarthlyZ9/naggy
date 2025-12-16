use log::debug;
use serde::Serialize;
use sqlx::SqlitePool;
use tauri::State;

use crate::db;

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: i64,
    pub description: String,
    pub scheduled_at: String,
    pub resolved: bool,
}

#[tauri::command]
pub async fn get_tasks(pool: State<'_, SqlitePool>, date: String) -> Result<Vec<Task>, String> {
    // Parse the ISO datetime string from the client (already in UTC)
    let datetime = chrono::DateTime::parse_from_rfc3339(&date)
        .map_err(|e| format!("Failed to parse date: {}", e))?;

    // Convert to UTC and extract the date portion
    let utc_datetime = datetime.with_timezone(&chrono::Utc);

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let tasks = db::fetch_unresolved_tasks(&mut tx, utc_datetime).await?;

    tx.commit().await.map_err(|e| e.to_string())?;

    debug!("tasks: {:?}", tasks);
    Ok(tasks)
}

#[tauri::command]
pub async fn add_task(
    pool: State<'_, SqlitePool>,
    description: String,
    scheduled_at: String,
) -> Result<Task, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Insert task into database
    let task = db::insert_task(&mut tx, description, scheduled_at).await?;

    tx.commit().await.map_err(|e| e.to_string())?;

    debug!("Task added: {:?}", task);
    Ok(task)
}

#[tauri::command]
pub async fn resolve_task(pool: State<'_, SqlitePool>, id: i64) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Mark task as resolved in database
    db::mark_task_resolved(&mut tx, id).await?;

    tx.commit().await.map_err(|e| e.to_string())?;

    debug!("Task {} resolved", id);
    Ok(())
}

#[tauri::command]
pub async fn remove_task(pool: State<'_, SqlitePool>, id: i64) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Delete task from database
    db::delete_task(&mut tx, id).await?;

    tx.commit().await.map_err(|e| e.to_string())?;

    debug!("Task {} removed", id);
    Ok(())
}

#[tauri::command]
pub async fn update_task(
    pool: State<'_, SqlitePool>,
    id: i64,
    description: Option<String>,
    scheduled_at: Option<String>,
) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Update task in database
    db::update_task(&mut tx, id, description, scheduled_at).await?;

    tx.commit().await.map_err(|e| e.to_string())?;

    debug!("Task {} updated", id);
    Ok(())
}

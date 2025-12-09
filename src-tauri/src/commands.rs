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
pub async fn get_tasks(pool: State<'_, SqlitePool>) -> Result<Vec<Task>, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let tasks = db::fetch_unresolved_tasks(&mut tx).await?;

    tx.commit().await.map_err(|e| e.to_string())?;

    println!("tasks: {:?}", tasks);
    Ok(tasks)
}

#[tauri::command]
pub async fn add_task(
    app: tauri::AppHandle,
    pool: State<'_, SqlitePool>,
    description: String,
    scheduled_at: String,
) -> Result<Task, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Insert task into database
    let task = db::insert_task(&mut tx, description, scheduled_at).await?;

    tx.commit().await.map_err(|e| e.to_string())?;

    println!("Task added: {:?}", task);
    Ok(task)
}

#[tauri::command]
pub async fn resolve_task(
    app: tauri::AppHandle,
    pool: State<'_, SqlitePool>,
    id: i64,
) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Mark task as resolved in database
    db::mark_task_resolved(&mut tx, id).await?;

    tx.commit().await.map_err(|e| e.to_string())?;

    println!("Task {} resolved", id);
    Ok(())
}

#[tauri::command]
pub async fn remove_task(
    app: tauri::AppHandle,
    pool: State<'_, SqlitePool>,
    id: i64,
) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Delete task from database
    db::delete_task(&mut tx, id).await?;

    tx.commit().await.map_err(|e| e.to_string())?;

    println!("Task {} removed", id);
    Ok(())
}

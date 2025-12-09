use sqlx::{Row, Transaction, Sqlite};
use crate::commands::Task;

/// Insert a new task into the database
/// Returns the created task with its ID
pub async fn insert_task(
    tx: &mut Transaction<'_, Sqlite>,
    description: String,
    scheduled_at: String,
) -> Result<Task, String> {
    let result = sqlx::query("INSERT INTO task (description, scheduled_at) VALUES (?, ?)")
        .bind(&description)
        .bind(&scheduled_at)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;

    let id = result.last_insert_rowid();

    let row = sqlx::query("SELECT id, description, scheduled_at, resolved FROM task WHERE id = ?")
        .bind(id)
        .fetch_one(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;

    let task = Task {
        id: row.get("id"),
        description: row.get("description"),
        scheduled_at: row.get("scheduled_at"),
        resolved: row.get("resolved"),
    };

    Ok(task)
}

/// Fetch all unresolved tasks from the database
pub async fn fetch_unresolved_tasks(
    tx: &mut Transaction<'_, Sqlite>,
) -> Result<Vec<Task>, String> {
    let rows = sqlx::query(
        "SELECT id, description, scheduled_at, resolved FROM task WHERE resolved = 0 ORDER BY scheduled_at ASC",
    )
    .fetch_all(&mut **tx)
    .await
    .map_err(|e| e.to_string())?;

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

/// Mark a task as resolved in the database
pub async fn mark_task_resolved(
    tx: &mut Transaction<'_, Sqlite>,
    id: i64,
) -> Result<(), String> {
    sqlx::query("UPDATE task SET resolved = 1 WHERE id = ?")
        .bind(&id)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Delete a task from the database
pub async fn delete_task(
    tx: &mut Transaction<'_, Sqlite>,
    id: i64,
) -> Result<(), String> {
    sqlx::query("DELETE FROM task WHERE id = ?")
        .bind(&id)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Fetch a task by ID
#[allow(dead_code)]
pub async fn fetch_task_by_id(
    tx: &mut Transaction<'_, Sqlite>,
    id: i64,
) -> Result<Option<Task>, String> {
    let row = sqlx::query("SELECT id, description, scheduled_at, resolved FROM task WHERE id = ?")
        .bind(id)
        .fetch_optional(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;

    let task = row.map(|r| Task {
        id: r.get("id"),
        description: r.get("description"),
        scheduled_at: r.get("scheduled_at"),
        resolved: r.get("resolved"),
    });

    Ok(task)
}

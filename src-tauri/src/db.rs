use crate::commands::Task;
use sqlx::{Row, Sqlite, Transaction};

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
pub async fn fetch_unresolved_tasks(tx: &mut Transaction<'_, Sqlite>, date: chrono::DateTime<chrono::Utc>) -> Result<Vec<Task>, String> {
    let rows = sqlx::query(
        "SELECT id, description, scheduled_at, resolved FROM task WHERE resolved = 0 AND scheduled_at >= ? ORDER BY scheduled_at ASC",
    )
    .bind(date.to_rfc3339())
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
pub async fn mark_task_resolved(tx: &mut Transaction<'_, Sqlite>, id: i64) -> Result<(), String> {
    sqlx::query("UPDATE task SET resolved = 1 WHERE id = ?")
        .bind(&id)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Delete a task from the database
pub async fn delete_task(tx: &mut Transaction<'_, Sqlite>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM task WHERE id = ?")
        .bind(&id)
        .execute(&mut **tx)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Update a task in the database
/// Updates description and/or scheduled_at if provided (not null)
pub async fn update_task(
    tx: &mut Transaction<'_, Sqlite>,
    id: i64,
    description: Option<String>,
    scheduled_at: Option<String>,
) -> Result<(), String> {
    // Build dynamic UPDATE query based on what fields are provided
    let mut updates = Vec::new();
    let mut params: Vec<String> = Vec::new();

    if let Some(desc) = description {
        updates.push("description = ?");
        params.push(desc);
    }

    if let Some(sched) = scheduled_at {
        updates.push("scheduled_at = ?");
        params.push(sched);
    }

    // If no fields to update, return early
    if updates.is_empty() {
        return Ok(());
    }

    let query_str = format!("UPDATE task SET {} WHERE id = ?", updates.join(", "));

    let mut query = sqlx::query(&query_str);
    for param in params {
        query = query.bind(param);
    }
    query = query.bind(id);

    query.execute(&mut **tx).await.map_err(|e| e.to_string())?;

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

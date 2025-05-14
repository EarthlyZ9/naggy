use tauri_plugin_sql::Database;

#[tauri::command]
async fn insert_task(db: State<'_, Database>, description: String) -> Result<(), String> {
    let query = "INSERT INTO task (description, scheduled_at, resolved) VALUES (?1, DATETIME('now'), 0)";
    db.execute(query, &[&description])
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_tasks(db: State<'_, Database>) -> Result<Vec<(i32, String, String, bool)>, String> {
    let query = "SELECT id, description, scheduled_at, resolved FROM task";
    let rows = db
        .fetch_all(query, &[])
        .await
        .map_err(|e| e.to_string())?;
    Ok(rows)
}
const db = require('./server/db');

console.log("Checking automations schema for created_at...");

db.serialize(() => {
    db.all("PRAGMA table_info(automations)", (err, rows) => {
        if (err) {
            console.error("Error checking table:", err);
            return;
        }
        const hasCreatedAt = rows.some(r => r.name === 'created_at');
        if (!hasCreatedAt) {
            console.log("Adding created_at column to automations...");
            db.run("ALTER TABLE automations ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP", (err) => {
                if (err) console.error("Error adding column:", err);
                else console.log("Added created_at column.");
            });
        } else {
            console.log("created_at column already exists.");
        }
    });
});

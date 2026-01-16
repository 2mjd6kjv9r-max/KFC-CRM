const db = require('./server/db');

db.serialize(() => {
    db.all("PRAGMA table_info(automations)", (err, rows) => {
        if (err) {
            console.error("Error getting table info:", err);
        } else {
            console.log("Automations Table Schema:");
            console.table(rows);
        }
    });

    db.all("SELECT * FROM automations", (err, rows) => {
        if (err) console.error("Error querying automations:", err);
        else console.log("Rows:", rows);
    })
});

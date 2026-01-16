const db = require('./server/db');

db.all("SELECT * FROM segments", (err, rows) => {
    if (err) {
        console.error("Error:", err);
    } else {
        console.log("Segments count:", rows.length);
        console.log("Rows:", rows);
    }
});

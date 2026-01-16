const db = require('./server/db');

db.serialize(() => {
    db.all("PRAGMA table_info(automations)", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log(JSON.stringify(rows));
        }
    });
});

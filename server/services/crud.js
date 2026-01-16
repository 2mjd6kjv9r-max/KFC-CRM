const db = require('../db');

const AutomationEngine = require('./automation_engine');

const CrudService = {
    // Users
    getUsers: (page = 1, limit = 50, search = '') => {
        const offset = (page - 1) * limit;
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM users";
            const params = [];

            if (search) {
                sql += " WHERE id LIKE ? OR loyalty_tier LIKE ?";
                params.push(`%${search}%`, `%${search}%`);
            }

            sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            params.push(limit, offset);

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    createUser: (data) => {
        const { id, download_date, registration_date, loyalty_tier } = data;
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("INSERT INTO users (id, download_date, registration_date, loyalty_tier, lifecycle_stage) VALUES (?, ?, ?, ?, 'Lead')");
            stmt.run(id, download_date, registration_date, loyalty_tier, function (err) {
                if (err) reject(err);

                // Trigger Automation
                AutomationEngine.trigger('Registration', data);

                resolve({ id, ...data });
            });
        });
    },

    updateUser: (id, data) => {
        const { download_date, registration_date, loyalty_tier } = data;
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("UPDATE users SET download_date = ?, registration_date = ?, loyalty_tier = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            stmt.run(download_date, registration_date, loyalty_tier, id, function (err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    },

    deleteUser: (id) => {
        return new Promise((resolve, reject) => {
            // Cascade delete orders/events/history
            db.serialize(() => {
                db.run("DELETE FROM orders WHERE user_id = ?", [id]);
                db.run("DELETE FROM app_events WHERE user_id = ?", [id]);
                db.run("DELETE FROM lifecycle_history WHERE user_id = ?", [id]);
                db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
                    if (err) reject(err);
                    else resolve({ deleted: true });
                });
            });
        });
    },

    // Orders
    getOrders: (page = 1, limit = 50) => {
        const offset = (page - 1) * limit;
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM orders ORDER BY order_time DESC LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    createOrder: (data) => {
        const { user_id, order_time, amount } = data;
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("INSERT INTO orders (user_id, order_time, amount) VALUES (?, ?, ?)");
            stmt.run(user_id, order_time, amount, function (err) {
                if (err) reject(err);

                // Trigger Automation
                AutomationEngine.trigger('Order', data);

                resolve({ id: this.lastID, ...data });
            });
        });
    },

    deleteOrder: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM orders WHERE id = ?", [id], function (err) {
                if (err) reject(err);
                else resolve({ deleted: true });
            });
        });
    }
};

module.exports = CrudService;

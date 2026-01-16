const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const AnalyticsService = require('./services/analytics');
const CrudService = require('./services/crud');
const LifecycleService = require('./services/lifecycle');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3001;

// --- AUTH ROUTES ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM admins WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid credentials" });

        // Simple plaintext check for now as per minimal viable setup
        if (row.password_hash !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Return a dummy token (in production use JWT)
        res.json({ token: "fake-jwt-token-" + Date.now(), user: { email: row.email, id: row.id } });
    });
});

// --- ANALYTICS ROUTES ---

app.get('/api/dashboard', async (req, res) => {
    try {
        const { from, to } = req.query;
        const data = await AnalyticsService.getDashboardKPIs(from, to);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/funnel', async (req, res) => {
    try {
        const { from, to } = req.query;
        const data = await AnalyticsService.getFunnel(from, to);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/cohorts', async (req, res) => {
    try {
        const data = await AnalyticsService.getCohorts();
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/retention', async (req, res) => {
    try {
        const { cohort_month, window } = req.query;
        const data = await AnalyticsService.getRetention(cohort_month, parseInt(window) || 30);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/segments/preview', (req, res) => {
    const { filters } = req.body;
    let sql = "SELECT u.*, COALESCE(o.order_count, 0) as order_count FROM users u LEFT JOIN (SELECT user_id, count(*) as order_count FROM orders GROUP BY user_id) o ON u.id = o.user_id WHERE 1=1";
    const params = [];

    if (filters && Array.isArray(filters)) {
        filters.forEach(f => {
            if (f.field === 'order_count') {
                if (f.op === '=') { sql += " AND (order_count = ?)"; params.push(f.value); }
                else if (f.op === '>') { sql += " AND order_count > ?"; params.push(f.value); }
                else if (f.op === '<') { sql += " AND order_count < ?"; params.push(f.value); }
            }
            else if (['lifecycle_stage', 'loyalty_tier'].includes(f.field)) {
                if (f.op === '=') { sql += ` AND ${f.field} = ?`; params.push(f.value); }
                else if (f.op === '!=') { sql += ` AND ${f.field} != ?`; params.push(f.value); }
            }
            else if (['download_date', 'registration_date'].includes(f.field)) {
                if (f.op === '>') { sql += ` AND ${f.field} > ?`; params.push(f.value); }
                else if (f.op === '<') { sql += ` AND ${f.field} < ?`; params.push(f.value); }
            }
        });
    }
    sql += " LIMIT 50";
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ total_count: 999, preview_users: rows });
    });
});

app.post('/api/lifecycle/refresh', async (req, res) => {
    try {
        await LifecycleService.recalculateAll();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/customers/:id/lifecycle-history', (req, res) => {
    db.all("SELECT * FROM lifecycle_history WHERE user_id = ? ORDER BY start_time DESC", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- CRUD ROUTES (User Manager) ---

app.get('/api/users', async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        const rows = await CrudService.getUsers(parseInt(page) || 1, parseInt(limit) || 50, search);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users', async (req, res) => {
    try {
        const data = await CrudService.createUser(req.body);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const data = await CrudService.updateUser(req.params.id, req.body);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await CrudService.deleteUser(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CRUD ROUTES (Order Manager) ---

app.get('/api/orders', async (req, res) => {
    try {
        const { page, limit } = req.query;
        const rows = await CrudService.getOrders(parseInt(page) || 1, parseInt(limit) || 50);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const data = await CrudService.createOrder(req.body);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await CrudService.deleteOrder(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- AUTOMATION (CRUD) ---

app.get('/api/automations', (req, res) => {
    db.all("SELECT * FROM automations ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/automations', (req, res) => {
    const { name, trigger, condition, actionType, actionValue } = req.body;
    const stmt = db.prepare("INSERT INTO automations (name, trigger_cnt, condition_cnt, action_type, action_value) VALUES (?, ?, ?, ?, ?)");
    stmt.run(name, trigger, condition, actionType, actionValue, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, ...req.body });
    });
});

app.delete('/api/automations/:id', (req, res) => {
    db.run("DELETE FROM automations WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- SEGMENTS (CRUD) ---

app.get('/api/segments', (req, res) => {
    db.all("SELECT * FROM segments ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/segments', (req, res) => {
    const { name, rule, filters } = req.body; // filters is JSON object or string
    const filtersStr = typeof filters === 'string' ? filters : JSON.stringify(filters);

    const stmt = db.prepare("INSERT INTO segments (name, rule, filters) VALUES (?, ?, ?)");
    stmt.run(name, rule, filtersStr, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, rule, filters });
    });
});

app.delete('/api/segments/:id', (req, res) => {
    db.run("DELETE FROM segments WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Enterprise CRM Backend running on http://localhost:${PORT}`);
});

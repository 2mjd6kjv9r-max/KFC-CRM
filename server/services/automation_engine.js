const db = require('../db');

const AutomationEngine = {
    // Run SQL helper
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    trigger: async (eventName, entity) => {
        console.log(`[Automation] Triggered: ${eventName} for ${entity.id || entity.user_id}`);

        // 1. Get Automations for this trigger
        const automations = await AutomationEngine.run("SELECT * FROM automations WHERE trigger_cnt = ?", [eventName]);

        for (const rule of automations) {
            console.log(`[Automation] Evaluating rule: ${rule.name}`);
            let conditionMet = false;

            // 2. Check Condition
            if (rule.condition_cnt === 'NoOrder') {
                // Check if user has orders
                const userId = entity.user_id || entity.id;
                const orders = await AutomationEngine.run("SELECT count(*) as count FROM orders WHERE user_id = ?", [userId]);
                if (orders[0].count === 0) conditionMet = true;
            } else if (rule.condition_cnt === 'HighValue') {
                // Check if current order > 50 (Assuming entity is order)
                if (entity.amount > 50) conditionMet = true;
            } else if (rule.condition_cnt === 'Inactive30') {
                // Complex checks usually done in batch, skipping for eager trigger
            } else {
                // No condition or unknown
                conditionMet = true;
            }

            // 3. Execute Action
            if (conditionMet) {
                console.log(`[Automation] Action: ${rule.action_type} -> ${rule.action_value}`);

                if (rule.action_type === 'UpdateStage') {
                    const userId = entity.user_id || entity.id;
                    await AutomationEngine.run("UPDATE users SET lifecycle_stage = ? WHERE id = ?", [rule.action_value, userId]);
                    // Log history
                    await AutomationEngine.run("INSERT INTO lifecycle_history (user_id, stage, start_time) VALUES (?, ?, ?)",
                        [userId, rule.action_value, new Date().toISOString()]);
                } else {
                    // Log "sending" (simulated)
                    // In real app, call EmailService or PushService
                    console.log(`[SIMULATION] Sent ${rule.action_type}: ${rule.action_value}`);
                }
            }
        }
    }
};

module.exports = AutomationEngine;

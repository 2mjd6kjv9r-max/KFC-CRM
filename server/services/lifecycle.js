const db = require('../db');

const LifecycleService = {
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    recalculateAll: async () => {
        console.log("Recalculating Lifecycle Stages...");
        const users = await LifecycleService.run("SELECT * FROM users");
        const now = new Date();

        for (const user of users) {
            // Get orders
            const orders = await LifecycleService.run("SELECT * FROM orders WHERE user_id = ? ORDER BY order_time DESC", [user.id]);

            let newStage = 'Lead';

            if (orders.length === 0) {
                newStage = 'Lead';
            } else {
                const lastOrderDate = new Date(orders[0].order_time);
                const daysSinceLastOrder = (now - lastOrderDate) / (1000 * 60 * 60 * 24);

                if (daysSinceLastOrder >= 60) {
                    newStage = 'Churned';
                } else if (daysSinceLastOrder >= 30) {
                    newStage = 'At Risk';
                } else {
                    // Recent order (< 30 days)
                    // Check for Active (>= 2 orders in last 30 days)
                    const ordersInLast30Days = orders.filter(o => {
                        const d = new Date(o.order_time);
                        return (now - d) / (1000 * 60 * 60 * 24) <= 30;
                    });

                    if (ordersInLast30Days.length >= 2) {
                        newStage = 'Active';
                    } else {
                        // Check for Repeat (orders in 2 consecutive months)
                        // Simplify: Just check if they have orders in different months
                        const months = new Set(orders.map(o => o.order_time.substring(0, 7))); // YYYY-MM
                        if (months.size >= 2) {
                            newStage = 'Repeat';
                        } else {
                            // Just 1 order or didn't meet Active criteria
                            newStage = 'Active'; // Fallback for 1 order customers who are recent
                        }
                    }
                }
            }

            if (user.lifecycle_stage !== newStage) {
                // Update user
                await LifecycleService.run("UPDATE users SET lifecycle_stage = ? WHERE id = ?", [newStage, user.id]);

                // Log history
                await LifecycleService.run("INSERT INTO lifecycle_history (user_id, stage, start_time) VALUES (?, ?, ?)",
                    [user.id, newStage, new Date().toISOString()]);

                // Close previous history? (Optional, skipping for simplicity)
                console.log(`Updated user ${user.id} to ${newStage}`);
            }
        }
        return { success: true };
    }
};

module.exports = LifecycleService;

const db = require('./db');

const SEED_SIZE = 500; // Generate 500 users
const START_DATE = new Date('2025-01-01');

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

const tiers = ['None', 'Silver', 'Gold', 'Platinum'];
const stages = ['Lead', 'MQL', 'Active', 'At Risk', 'Churned'];

console.log('Starting seed process...');

db.serialize(() => {
    // Clear existing data
    db.run("DELETE FROM users");
    db.run("DELETE FROM orders");
    db.run("DELETE FROM app_events");
    db.run("DELETE FROM lifecycle_history");

    const userStmt = db.prepare("INSERT INTO users (id, download_date, registration_date, loyalty_tier) VALUES (?, ?, ?, ?)");
    const eventStmt = db.prepare("INSERT INTO app_events (user_id, event_name, event_time) VALUES (?, ?, ?)");
    const orderStmt = db.prepare("INSERT INTO orders (user_id, order_time, amount) VALUES (?, ?, ?)");
    const historyStmt = db.prepare("INSERT INTO lifecycle_history (user_id, stage, start_time, end_time) VALUES (?, ?, ?, ?)");

    const now = new Date();

    db.run("BEGIN TRANSACTION");

    for (let i = 0; i < SEED_SIZE; i++) {
        const userId = `user_${i}`;

        // 1. Download & Registration
        // 80% convert from download to registration
        const downloadDate = randomDate(START_DATE, now);
        const registered = Math.random() > 0.2;
        let registrationDate = null;

        if (registered) {
            registrationDate = addDays(downloadDate, Math.floor(Math.random() * 5)); // 0-5 days after download
            if (registrationDate > now) registrationDate = now;
        }

        const tier = registered ? tiers[Math.floor(Math.random() * tiers.length)] : 'None';

        userStmt.run(userId, downloadDate.toISOString(), registrationDate ? registrationDate.toISOString() : null, tier);

        // 2. Lifecycle & Events if registered
        if (registered) {
            // Generate App Opens (MQL Logic: > 5 opens)
            const openCount = Math.floor(Math.random() * 20); // 0 to 20 opens
            for (let j = 0; j < openCount; j++) {
                const eventTime = randomDate(registrationDate, now);
                eventStmt.run(userId, 'app_open', eventTime.toISOString());
            }

            // 3. Orders
            // 40% of registered users make an order
            const hasOrdered = Math.random() > 0.6;
            let lastOrderDate = null;

            if (hasOrdered) {
                const orderCount = Math.floor(Math.random() * 15) + 1; // 1 to 15 orders
                // Spread orders from registration to now
                for (let k = 0; k < orderCount; k++) {
                    const orderTime = randomDate(registrationDate, now);
                    const amount = (Math.random() * 50 + 10).toFixed(2);
                    orderStmt.run(userId, orderTime.toISOString(), amount);

                    if (!lastOrderDate || orderTime > lastOrderDate) {
                        lastOrderDate = orderTime;
                    }
                }
            }

            // 4. Initial Lifecycle History
            // Just inserting a current state record for simplicity of the seed, 
            // naturally this should be historical but for "Last Known State" logic we want at least one open row.
            let currentStage = 'Lead';
            if (hasOrdered) {
                const daysSinceLastOrder = (now - lastOrderDate) / (1000 * 60 * 60 * 24);
                if (daysSinceLastOrder > 60) currentStage = 'Churned';
                else if (daysSinceLastOrder > 30) currentStage = 'At Risk';
                else currentStage = 'Active';
            } else if (openCount >= 5) {
                currentStage = 'MQL'; // Derived stage for logic
            }

            historyStmt.run(userId, currentStage, registrationDate.toISOString(), null);
        }
    }

    db.run("COMMIT", () => {
        console.log(`Seeding complete. Generated ${SEED_SIZE} users.`);
    });

    userStmt.finalize();
    eventStmt.finalize();
    orderStmt.finalize();
    historyStmt.finalize();
});

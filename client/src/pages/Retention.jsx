import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Retention = () => {
    const [metrics, setMetrics] = useState(null);
    const [window, setWindow] = useState(30);

    const [error, setError] = useState(null);
    useEffect(() => {
        setMetrics(null);
        setError(null);
        // Defaults to '2025-01' for demo. In real app, use a prompt/selector.
        fetch(`http://localhost:3001/api/retention?cohort_month=2025-01&window=${window}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load");
                return res.json();
            })
            .then(setMetrics)
            .catch(err => setError(err.message));
    }, [window]);

    if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

    if (!metrics) return <div>Loading...</div>;

    const chartData = [
        { name: 'Retained', value: parseFloat(metrics.retention_pct) },
        { name: 'Churned', value: 100 - parseFloat(metrics.retention_pct) },
    ];

    return (
        <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'flex-end' }}>
                <button className={`btn ${window === 30 ? 'btn-primary' : ''}`} onClick={() => setWindow(30)}>30 Days</button>
                <button className={`btn ${window === 60 ? 'btn-primary' : ''}`} onClick={() => setWindow(60)}>60 Days</button>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="stat-label">Cohort Size</div>
                    <div className="stat-value">{metrics.cohort_size}</div>
                </div>
                <div className="card">
                    <div className="stat-label">Returning Users</div>
                    <div className="stat-value">{metrics.returning_users}</div>
                </div>
                <div className="card">
                    <div className="stat-label">Retention Rate</div>
                    <div className="stat-value" style={{ color: '#E4002B' }}>{metrics.retention_pct}%</div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>Users who ordered again within {window} days</p>
                </div>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Retention Split</h3>
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#E4002B" barSize={20} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Retention;

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Funnel = () => {
    const [dateRange, setDateRange] = useState({
        label: '30d',
        from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    const updateRange = (label) => {
        const to = new Date().toISOString().split('T')[0];
        let from = to;
        if (label === '7d') from = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        if (label === '30d') from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        if (label === 'Today') from = to;
        setDateRange({ label, from, to });
    };

    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3001/api/funnel?from=${dateRange.from}&to=${dateRange.to}`)
            .then(res => res.json())
            .then(d => {
                const colors = ['#f3f4f6', '#d1d5db', '#9ca3af', '#fca5a5', '#ef4444', '#b91c1c'];
                const formatted = d.map((step, i) => ({
                    ...step,
                    color: colors[i] || '#ccc'
                }));
                setData(formatted);
            });
    }, [dateRange]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Funnel Analytics</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <div className="btn-group" style={{ background: 'white', border: '1px solid #ddd', borderRadius: 6, display: 'flex', overflow: 'hidden' }}>
                        {['Today', '7d', '30d'].map(l => (
                            <button
                                key={l}
                                onClick={() => updateRange(l)}
                                style={{
                                    border: 'none',
                                    background: dateRange.label === l ? '#E4002B' : 'white',
                                    color: dateRange.label === l ? 'white' : 'black',
                                    padding: '6px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Conversion Funnel</h3>
                <div style={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Funnel;

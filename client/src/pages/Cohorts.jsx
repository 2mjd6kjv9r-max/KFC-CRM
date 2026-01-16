import React, { useEffect, useState } from 'react';

const Cohorts = () => {
    const [data, setData] = useState({ cohorts: [] });

    useEffect(() => {
        fetch('http://localhost:3001/api/cohorts')
            .then(res => res.json())
            .then(setData);
    }, []);

    return (
        <div>{/* Header removed */}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                    <thead>
                        <tr style={{ background: '#f9fafb' }}>
                            <th>Cohort Month</th>
                            <th>Total Users</th>
                            <th>Gold Members</th>
                            <th>Gold %</th>
                            <th>Customers (&gt;0 Orders)</th>
                            <th>Avg Orders/User</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.cohorts.map((row, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{row.month}</td>
                                <td>{row.cohort_users}</td>
                                <td>{row.gold_users}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 50, height: 4, background: '#eee', borderRadius: 2 }}>
                                            <div style={{ width: `${row.gold_conversion_pct}%`, height: '100%', background: '#F59E0B' }}></div>
                                        </div>
                                        {row.gold_conversion_pct}%
                                    </div>
                                </td>
                                <td>{row.customers_users}</td>
                                <td>{row.avg_orders_per_user}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Cohorts;

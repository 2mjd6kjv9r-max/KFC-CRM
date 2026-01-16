import React, { useEffect, useState } from 'react';

const DataExplorer = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetch('http://localhost:3001/api/users')
            .then(res => res.json())
            .then(setUsers);
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(filter.toLowerCase()) ||
        u.email.toLowerCase().includes(filter.toLowerCase()) ||
        u.lifecycle_stage.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div>


            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button className="btn btn-primary" onClick={() => alert("Exporting CSV...")}>Export CSV</button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Stage</th>
                                <th>Orders</th>
                                <th>Last Order</th>
                                <th>Loyalty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td style={{ fontFamily: 'monospace' }}>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.lifecycle_stage === 'Active' ? 'badge-active' :
                                            user.lifecycle_stage === 'Churned' ? 'badge-churned' : ''
                                            }`}>
                                            {user.lifecycle_stage}
                                        </span>
                                    </td>
                                    <td>{user.order_count}</td>
                                    <td>{user.last_order_date || '-'}</td>
                                    <td>
                                        {user.loyalty_tier === 'Gold' && <span className="badge badge-gold">Gold</span>}
                                        {user.loyalty_tier !== 'Gold' && user.loyalty_tier}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataExplorer;

import React, { useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';

const Lifecycle = () => {
    const [userId, setUserId] = useState('');
    const [history, setHistory] = useState([]);

    const fetchHistory = (e) => {
        e.preventDefault();
        fetch(`http://localhost:3001/api/customers/${userId}/lifecycle-history`)
            .then(res => res.json())
            .then(setHistory)
            .catch(console.error);
    };

    return (

        <div>
            <div style={{ marginBottom: '1rem' }}>
                <form onSubmit={fetchHistory} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        value={userId}
                        onChange={e => setUserId(e.target.value)}
                        placeholder="Enter User ID (e.g. user_0)"
                        style={{ padding: '0.5rem', width: 300 }}
                    />
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>
            </div>

            <div className="card">
                <h3>Stage Progression</h3>
                {history.length === 0 ? (
                    <p style={{ color: '#666' }}>No history found or user not selected.</p>
                ) : (
                    <div style={{ position: 'relative', marginTop: '2rem' }}>
                        {history.map((record, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: '50%',
                                    background: record.end_time ? '#ddd' : '#E4002B',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 2, position: 'relative'
                                }}>
                                    {i + 1}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{record.stage}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                        {new Date(record.start_time).toLocaleDateString()}
                                        {record.end_time && ` — ${new Date(record.end_time).toLocaleDateString()}`}
                                    </div>
                                </div>
                                {i < history.length - 1 && (
                                    <div style={{
                                        position: 'absolute', left: 14, top: 30 + (i * 72),
                                        width: 2, height: 40, background: '#eee', zIndex: 1
                                    }}></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Lifecycle;

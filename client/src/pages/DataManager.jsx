import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Search, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const DataManager = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const queryClient = useQueryClient();

    // Queries
    const { data: usersData } = useQuery({
        queryKey: ['users', page, search],
        queryFn: () => fetch(`http://localhost:3001/api/users?page=${page}&limit=20&search=${search}`).then(res => res.json()),
        enabled: activeTab === 'users',
        keepPreviousData: true
    });

    const { data: ordersData } = useQuery({
        queryKey: ['orders', page],
        queryFn: () => fetch(`http://localhost:3001/api/orders?page=${page}&limit=20`).then(res => res.json()),
        enabled: activeTab === 'orders'
    });

    // Mutations
    const saveMutation = useMutation({
        mutationFn: async ({ url, method, payload }) => {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to save');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            queryClient.invalidateQueries(['orders']);
            queryClient.invalidateQueries(['dashboard']); // Refresh KPI
            setModalOpen(false);
            setEditingItem(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`http://localhost:3001/api/${activeTab}/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries([activeTab]);
            queryClient.invalidateQueries(['dashboard']);
        }
    });

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());

        const url = editingItem
            ? `http://localhost:3001/api/${activeTab}/${activeTab === 'users' ? editingItem.id : editingItem.id}`
            : `http://localhost:3001/api/${activeTab}`;
        const method = editingItem ? 'PUT' : 'POST';

        saveMutation.mutate({ url, method, payload });
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this item? all related data will be lost.')) {
            deleteMutation.mutate(id);
        }
    };

    const data = activeTab === 'users' ? (usersData || []) : (ordersData || []);

    return (
        <div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
                <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
                <button className="btn" onClick={() => { setEditingItem(null); setModalOpen(true); }} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    <Plus size={16} style={{ marginRight: 6 }} /> Add {activeTab === 'users' ? 'User' : 'Order'}
                </button>
            </div>

            {/* Error Message */}
            {saveMutation.isError && <div style={{ color: 'white', background: 'red', padding: 8, borderRadius: 4, margin: '10px 0' }}>Error saving data. Check console.</div>}

            {activeTab === 'users' && (
                <div style={{ margin: '1rem 0' }}>
                    <div style={{ position: 'relative', width: 300 }}>
                        <Search size={16} style={{ position: 'absolute', top: 10, left: 10, color: '#999' }} />
                        <input
                            placeholder="Search User ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ padding: '8px 8px 8px 32px', width: '100%', borderRadius: 8, border: '1px solid #ccc' }}
                        />
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                    <thead>
                        {activeTab === 'users' ? (
                            <tr><th>User ID</th><th>Download</th><th>Registered</th><th>Loyalty</th><th>Actions</th></tr>
                        ) : (
                            <tr><th>Order ID</th><th>User ID</th><th>Amount</th><th>Time</th><th>Actions</th></tr>
                        )}
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id}>
                                {activeTab === 'users' ? (
                                    <>
                                        <td style={{ fontFamily: 'monospace' }}>{item.id}</td>
                                        <td>{item.download_date?.split('T')[0]}</td>
                                        <td>{item.registration_date ? item.registration_date.split('T')[0] : '-'}</td>
                                        <td><span className={`badge badge-${item.loyalty_tier?.toLowerCase()}`}>{item.loyalty_tier}</span></td>
                                    </>
                                ) : (
                                    <>
                                        <td>{item.id}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{item.user_id}</td>
                                        <td>${item.amount}</td>
                                        <td>{item.order_time?.split('T')[0]}</td>
                                    </>
                                )}
                                <td>
                                    <button className="btn" style={{ padding: 4, marginRight: 4 }} onClick={() => { setEditingItem(item); setModalOpen(true); }}>
                                        <Edit2 size={14} />
                                    </button>
                                    <button className="btn" style={{ padding: 4, color: '#DC2626' }} onClick={() => handleDelete(item.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: 400 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>{editingItem ? 'Edit' : 'Add'} {activeTab === 'users' ? 'User' : 'Order'}</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setModalOpen(false)} />
                        </div>
                        <form onSubmit={handleSave}>
                            {activeTab === 'users' ? (
                                <>
                                    <label className="stat-label">User ID (Unique)</label>
                                    <input name="id" defaultValue={editingItem?.id} required disabled={!!editingItem} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
                                    <label className="stat-label">Download Date</label>
                                    <input name="download_date" type="date" defaultValue={editingItem?.download_date?.split('T')[0] || new Date().toISOString().split('T')[0]} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
                                    <label className="stat-label">Registration Date</label>
                                    <input name="registration_date" type="date" defaultValue={editingItem?.registration_date?.split('T')[0]} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
                                    <label className="stat-label">Loyalty Tier</label>
                                    <select name="loyalty_tier" defaultValue={editingItem?.loyalty_tier || 'None'} style={{ width: '100%', padding: 8, marginBottom: 10 }}>
                                        <option value="None">None</option>
                                        <option value="Silver">Silver</option>
                                        <option value="Gold">Gold</option>
                                        <option value="Platinum">Platinum</option>
                                    </select>
                                </>
                            ) : (
                                <>
                                    <label className="stat-label">User ID (Must Exist)</label>
                                    <input name="user_id" defaultValue={editingItem?.user_id} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
                                    <label className="stat-label">Amount ($)</label>
                                    <input name="amount" type="number" step="0.01" defaultValue={editingItem?.amount} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
                                    <label className="stat-label">Order Time</label>
                                    <input name="order_time" type="datetime-local" defaultValue={editingItem?.order_time || new Date().toISOString().slice(0, 16)} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
                                </>
                            )}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 10 }}>
                                {saveMutation.isLoading ? 'Saving...' : 'Save Data'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataManager;

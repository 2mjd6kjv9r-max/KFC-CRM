import React, { useState } from 'react';
import { Users, Filter, Eye, Plus, X, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Segments = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [preview, setPreview] = useState(null);
    const queryClient = useQueryClient();

    // Fetch Segments
    const { data: segments } = useQuery({
        queryKey: ['segments'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/segments');
            const data = await res.json();
            // Fetch counts for each segment dynamically
            const segmentsWithCounts = await Promise.all(data.map(async (seg) => {
                let filters = seg.filters;
                try { filters = typeof seg.filters === 'string' ? JSON.parse(seg.filters) : seg.filters; } catch (e) { }

                const countRes = await fetch('http://localhost:3001/api/segments/preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filters })
                });
                const countData = await countRes.json();
                return { ...seg, count: countData.preview_users?.length || 0, parsedFilters: filters };
            }));
            return segmentsWithCounts;
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newSegment) => {
            const res = await fetch('http://localhost:3001/api/segments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSegment)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['segments']);
            setIsCreating(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`http://localhost:3001/api/segments/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => queryClient.invalidateQueries(['segments'])
    });

    const [newFilters, setNewFilters] = useState([{ field: 'lifecycle_stage', op: '=', value: 'Active' }]);

    const addFilter = () => setNewFilters([...newFilters, { field: 'lifecycle_stage', op: '=', value: '' }]);
    const updateFilter = (index, key, val) => {
        const updated = [...newFilters];
        updated[index][key] = val;
        setNewFilters(updated);
    };
    const removeFilter = (index) => setNewFilters(newFilters.filter((_, i) => i !== index));

    const handleCreate = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');

        // Build readable rule string
        const rule = newFilters.map(f => `${f.field} ${f.op} ${f.value}`).join(' AND ');

        createMutation.mutate({ name, rule, filters: newFilters });
    };

    const handlePreview = async (seg) => {
        const res = await fetch('http://localhost:3001/api/segments/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filters: seg.parsedFilters })
        });
        const data = await res.json();
        setPreview({ name: seg.name, users: data.preview_users });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                    <Plus size={16} style={{ marginRight: 6 }} /> Create Segment
                </button>
            </div>

            <div className="grid-2">
                {segments?.map(seg => (
                    <div key={seg.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{seg.name}</h3>
                                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>
                                    <Filter size={12} style={{ marginRight: 4 }} />
                                    {seg.rule}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn" onClick={() => handlePreview(seg)} style={{ padding: '4px 8px' }} title="Preview Users">
                                    <Eye size={16} />
                                </button>
                                <button className="btn" onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(seg.id) }} style={{ padding: '4px 8px', color: 'red' }} title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span className="stat-value">{seg.count}</span>
                            <span className="stat-label">users matched</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: 400 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h3>Create New Segment</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setIsCreating(false)} />
                        </div>
                        <form onSubmit={handleCreate}>
                            <label className="stat-label">Segment Name</label>
                            <input name="name" required placeholder="e.g. Active Gold Users" style={{ width: '100%', padding: 8, marginBottom: 15 }} />

                            <label className="stat-label">Conditions (AND)</label>
                            {newFilters.map((f, i) => (
                                <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                                    <select value={f.field} onChange={e => updateFilter(i, 'field', e.target.value)} style={{ flex: 2, padding: 6 }}>
                                        <option value="lifecycle_stage">Lifecycle Stage</option>
                                        <option value="loyalty_tier">Loyalty Tier</option>
                                        <option value="order_count">Order Count</option>
                                        <option value="registration_date">Registration Date</option>
                                    </select>
                                    <select value={f.op} onChange={e => updateFilter(i, 'op', e.target.value)} style={{ flex: 1, padding: 6 }}>
                                        <option value="=">=</option>
                                        <option value="!=">!=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                    </select>
                                    <input value={f.value} onChange={e => updateFilter(i, 'value', e.target.value)} placeholder="Value..." style={{ flex: 1, padding: 6 }} />
                                    {newFilters.length > 1 && <button type="button" onClick={() => removeFilter(i)} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>X</button>}
                                </div>
                            ))}
                            <button type="button" onClick={addFilter} style={{ fontSize: '0.8rem', background: 'none', border: 'none', color: '#E4002B', cursor: 'pointer', marginBottom: 15 }}>
                                + Add Condition
                            </button>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                {createMutation.isLoading ? 'Creating...' : 'Create Segment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Section */}
            {preview && (
                <div style={{ marginTop: '2rem', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3>Preview: {preview.name}</h3>
                        <button className="btn" onClick={() => setPreview(null)}>Close</button>
                    </div>
                    {preview.users.length === 0 ? <p>No users match this criteria.</p> : (
                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                            <table>
                                <thead>
                                    <tr><th>ID</th><th>Download Date</th><th>Loyalty</th><th>Orders</th></tr>
                                </thead>
                                <tbody>
                                    {preview.users.map(u => (
                                        <tr key={u.id}>
                                            <td style={{ fontFamily: 'monospace' }}>{u.id}</td>
                                            <td>{u.download_date?.split('T')[0]}</td>
                                            <td>{u.loyalty_tier}</td>
                                            <td>{u.order_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Segments;

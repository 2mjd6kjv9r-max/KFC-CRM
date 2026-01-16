import React, { useState } from 'react';
import { Plus, ArrowRight, Zap, Target, Bell, Trash2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Automation = () => {
    const [isCreating, setIsCreating] = useState(false);
    const queryClient = useQueryClient();

    const { data: rules, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['automations'],
        queryFn: async () => {
            console.log("Fetching automations...");
            const res = await fetch('http://localhost:3001/api/automations');
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Network response was not ok');
            }
            const json = await res.json();
            console.log("Fetched rules:", json);
            return json;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newRule) => {
            const res = await fetch('http://localhost:3001/api/automations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRule)
            });
            if (!res.ok) throw new Error("Failed to save");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['automations']);
            setIsCreating(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`http://localhost:3001/api/automations/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => queryClient.invalidateQueries(['automations'])
    });

    const handleCreate = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newRule = {
            name: formData.get('name'),
            trigger: formData.get('trigger'),
            condition: formData.get('condition'),
            actionType: formData.get('actionType'),
            actionValue: formData.get('actionValue')
        };
        createMutation.mutate(newRule);
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>Loading workflows...</div>;

    if (isError) return (
        <div style={{ padding: '2rem', color: 'red' }}>
            <h3>Error loading workflows</h3>
            <pre>{error?.message}</pre>
            <button className="btn btn-primary" onClick={() => refetch()}>Try Again</button>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                    <Plus size={16} style={{ marginRight: 8 }} />
                    New Workflow
                </button>
            </div>

            {isCreating && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: 600, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Create New Workflow</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setIsCreating(false)} />
                        </div>

                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: 15 }}>
                                <label className="stat-label">Workflow Name</label>
                                <input name="name" required placeholder="e.g. Winback Campaign" style={{ width: '100%', padding: '10px', marginTop: 5, borderRadius: 6, border: '1px solid #ccc' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignItems: 'start' }}>
                                {/* Trigger Node */}
                                <div style={{ background: '#f9fafb', padding: 10, borderRadius: 8, border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#E4002B', fontWeight: 600 }}>
                                        <Zap size={14} /> Trigger
                                    </div>
                                    <select name="trigger" style={{ width: '100%', padding: 6 }}>
                                        <option value="Registration">Registration Date</option>
                                        <option value="Order">New Order</option>
                                    </select>
                                </div>

                                {/* Condition Node */}
                                <div style={{ background: '#f9fafb', padding: 10, borderRadius: 8, border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#2563EB', fontWeight: 600 }}>
                                        <Target size={14} /> Condition
                                    </div>
                                    <select name="condition" style={{ width: '100%', padding: 6 }}>
                                        <option value="NoOrder">Order Count = 0</option>
                                        <option value="HighValue">Order Value {'>'} 50</option>
                                        <option value="Inactive30">Inactive {'>'} 30 Days</option>
                                    </select>
                                </div>

                                {/* Action Node */}
                                <div style={{ background: '#f9fafb', padding: 10, borderRadius: 8, border: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#059669', fontWeight: 600 }}>
                                        <Bell size={14} /> Action
                                    </div>
                                    <select name="actionType" style={{ width: '100%', padding: 6, marginBottom: 6 }}>
                                        <option value="UpdateStage">Set Stage</option>
                                        <option value="Email">Send Email</option>
                                        <option value="Push">Push Notification</option>
                                    </select>
                                    <input name="actionValue" placeholder="Value..." style={{ width: '100%', padding: 6 }} />
                                </div>
                            </div>

                            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button type="button" className="btn" onClick={() => setIsCreating(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {createMutation.isLoading ? 'Saving...' : 'Save Workflow'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid-2">
                {rules?.map(rule => (
                    <div key={rule.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <strong style={{ fontSize: '1.1rem' }}>{rule.name} (ID: {rule.id})</strong>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <span className="badge badge-active">Active</span>
                                <Trash2 size={16} color="#aaa" style={{ cursor: 'pointer' }} onClick={() => {
                                    if (window.confirm('Delete workflow?')) deleteMutation.mutate(rule.id);
                                }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 10 }}>
                            {/* Trigger Node */}
                            <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 8, padding: '10px', minWidth: 140, textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#E4002B', fontWeight: 600, marginBottom: 4, fontSize: '0.75rem' }}>
                                    <Zap size={14} /> TRIGGER
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>{rule.trigger_cnt ? String(rule.trigger_cnt) : 'N/A'}</div>
                            </div>

                            <ArrowRight size={20} color="#ccc" style={{ margin: '0 8px', flexShrink: 0 }} />

                            {/* Condition Node */}
                            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px', minWidth: 140, textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#2563EB', fontWeight: 600, marginBottom: 4, fontSize: '0.75rem' }}>
                                    <Target size={14} /> CONDITION
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>{rule.condition_cnt ? String(rule.condition_cnt) : 'None'}</div>
                            </div>

                            <ArrowRight size={20} color="#ccc" style={{ margin: '0 8px', flexShrink: 0 }} />

                            {/* Action Node */}
                            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px', minWidth: 140, textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#059669', fontWeight: 600, marginBottom: 4, fontSize: '0.75rem' }}>
                                    <Bell size={14} /> ACTION
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>{rule.action_type || 'Unknown'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 2 }}>{rule.action_value || ''}</div>
                            </div>
                        </div>
                    </div>
                ))}
                {(!rules || rules.length === 0) && (
                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '3rem', color: '#999', background: '#fff', borderRadius: 8 }}>
                        No automation rules defined. Click "New Workflow" to start.
                    </div>
                )}
            </div>
            {/* DEBUG RAW DUMP */}
            <details style={{ marginTop: 50 }}>
                <summary>Debug Raw Data</summary>
                <pre>{JSON.stringify(rules, null, 2)}</pre>
            </details>
        </div>
    );
};

export default Automation;

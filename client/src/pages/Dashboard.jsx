import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownRight, Activity, Users, BarChart2, TrendingUp, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
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
        // 'Custom' not auto-set here, handled by inputs
        setDateRange({ label, from, to });
    };

    const { data: metrics, isLoading } = useQuery({
        queryKey: ['dashboard', dateRange.from, dateRange.to],
        queryFn: () => fetch(`http://localhost:3001/api/dashboard?from=${dateRange.from}&to=${dateRange.to}`).then(res => res.json()),
        refetchInterval: 30000
    });

    // Lifecycle Auto-Refresh on Load (Silent)
    React.useEffect(() => {
        fetch('http://localhost:3001/api/lifecycle/refresh', { method: 'POST' }).catch(console.error);
    }, []);

    if (isLoading || !metrics) return <div className="p-8">Loading Enterprise Dashboard...</div>;

    const cards = [
        { title: 'App Downloads', value: metrics.downloads, trend: 'N/A', diff: 0, color: 'blue' },
        { title: 'Registrations', value: metrics.registrations, trend: 'N/A', diff: 0, color: 'green' },
        { title: 'Active Customers', value: metrics.active_customers, trend: 'N/A', diff: 0, color: 'kfc-red' },
        { title: 'Churn Rate', value: metrics.customers ? `${((metrics.churned_customers / metrics.customers) * 100).toFixed(1)}%` : '0%', trend: 'N/A', diff: 0, color: 'orange' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Dashboard</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                    {/* Custom Range Inputs */}
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={e => setDateRange({ ...dateRange, label: 'Custom', from: e.target.value })}
                        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6 }}
                    />
                    <span style={{ color: '#999' }}>-</span>
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={e => setDateRange({ ...dateRange, label: 'Custom', to: e.target.value })}
                        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6 }}
                    />

                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        <RefreshCw size={14} style={{ marginRight: 6 }} /> Refresh
                    </button>
                </div>
            </div>

            {/* 1. TOP KPI CARDS */}
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
                {cards.map((card, i) => (
                    <div key={i} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="stat-label">{card.title}</span>
                        </div>
                        <div className="stat-value" style={{ marginTop: 8 }}>{card.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 4 }}>
                            IN SELECTED PERIOD
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. CHARTS ROW */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h3>Acquisition Trend</h3>
                    <div style={{ height: 300, fontSize: '0.75rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metrics.chart_data || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="registrations" stroke="#E4002B" strokeWidth={2} dot={false} name="Registrations" />
                                <Line type="monotone" dataKey="orders" stroke="#2D2926" strokeWidth={2} dot={false} name="Orders" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="card">
                    <h3>Order Volume</h3>
                    <div style={{ height: 300, fontSize: '0.75rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.chart_data || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#E4002B" radius={[4, 4, 0, 0]} name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. SECTION SUMMARIES Row */}
            <div className="grid-4">
                <SummaryCard
                    title="Funnel"
                    metric="MQL Conversion"
                    value="42%"
                    sub="View Conversion"
                    icon={Filter}
                    link="/funnel"
                />
                <SummaryCard
                    title="Cohorts"
                    metric="Gold Retention"
                    value="68%"
                    sub="View Retention"
                    icon={Users}
                    link="/cohorts"
                />
                <SummaryCard
                    title="Lifecycle"
                    metric="At Risk Users"
                    value={metrics.at_risk_customers}
                    sub="View Lifecycle"
                    icon={Activity}
                    link="/lifecycle"
                />
                <SummaryCard
                    title="Retention"
                    metric="Returning"
                    value="30%"
                    sub="View Churn"
                    icon={TrendingUp}
                    link="/retention-churn"
                />
            </div>
        </div>
    );
};

const SummaryCard = ({ title, metric, value, sub, icon: Icon, link }) => {
    const navigate = useNavigate();
    return (
        <div className="card" onClick={() => navigate(link)} style={{ cursor: 'pointer', borderLeft: '4px solid #E4002B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Icon size={16} color="#666" />
                <span style={{ fontWeight: 600 }}>{title}</span>
            </div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>{metric}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 4 }}>{sub}</div>
        </div>
    )
}

import { RefreshCw } from 'lucide-react';

export default Dashboard;

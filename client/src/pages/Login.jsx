import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SandersIcon from '../components/SandersIcon';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));
            window.location.href = '/'; // Force reload to update app state if needed
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
            <div style={{
                width: '400px',
                padding: '2rem',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <SandersIcon size={64} color="#E4002B" />
                </div>

                <h2 style={{ marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>Welcome Back</h2>
                <p style={{ marginBottom: '2rem', color: '#666' }}>Enter your credentials to access the CRM.</p>

                {error && <div style={{ background: '#FFF1F2', color: '#E4002B', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }}
                            placeholder="admin@local.test"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#E4002B',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#999' }}>
                    Secure Enterprise Access • v2.1.0
                </div>
            </div>
        </div>
    );
};

export default Login;

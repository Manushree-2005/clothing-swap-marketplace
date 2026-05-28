import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      localStorage.setItem('isAdmin', res.data.user.isAdmin);
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{
      maxWidth: '450px',
      margin: '3rem auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '24px',
      boxShadow: '0 20px 35px -12px rgba(0,0,0,0.2)',
      animation: 'fadeInUp 0.5s ease-out'
    }}>
      <h2 style={{ textAlign: 'center', color: '#1e3c32', marginBottom: '1.5rem' }}>Welcome Back</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.8rem',
            marginBottom: '1rem',
            border: '1px solid #ddd',
            borderRadius: '40px',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
          onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.2)'}
          onBlur={e => e.currentTarget.style.boxShadow = 'none'}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.8rem',
            marginBottom: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '40px',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
          onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.2)'}
          onBlur={e => e.currentTarget.style.boxShadow = 'none'}
        />
        <button
          type="submit"
          className="btn-animated"
          style={{
            width: '100%',
            padding: '0.8rem',
            backgroundColor: '#2d6a4f',
            color: 'white',
            border: 'none',
            borderRadius: '40px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Login
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        No account? <a href="/register" style={{ color: '#2d6a4f', textDecoration: 'none', fontWeight: 'bold' }}>Register here</a>
      </p>
    </div>
  );
};

export default Login;
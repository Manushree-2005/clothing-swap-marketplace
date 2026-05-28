import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, email, password, city });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 20px 35px -12px rgba(0,0,0,0.2)' }}>
      <h2 style={{ textAlign: 'center', color: '#1e3c32' }}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '40px', border: '1px solid #ccc' }}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '40px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '40px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="City (e.g., New York)"
          value={city}
          onChange={e => setCity(e.target.value)}
          required
          style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', borderRadius: '40px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '40px', fontWeight: 'bold', cursor: 'pointer' }}>Register</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>Already have an account? <a href="/login" style={{ color: '#2d6a4f' }}>Login</a></p>
    </div>
  );
};

export default Register;
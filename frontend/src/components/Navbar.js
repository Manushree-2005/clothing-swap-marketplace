import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const userId = localStorage.getItem('userId');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (token && userId) {
      const fetchPending = async () => {
        try {
          const res = await api.get('/swaps');
          const pending = res.data.filter(s => s.receiverId === userId && s.status === 'pending').length;
          setPendingCount(pending);
        } catch (err) {
          console.error('Failed to fetch pending count', err);
        }
      };
      fetchPending();
      const interval = setInterval(fetchPending, 10000);
      return () => clearInterval(interval);
    }
  }, [token, userId]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #1e3c32 0%, #2d6a4f 100%)',
      padding: '1rem 2rem',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Link to="/" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>♻️ Clothing Swap</Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Browse</Link>
        {token ? (
          <>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', position: 'relative' }}>
              Dashboard
              {pendingCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-15px',
                  backgroundColor: '#e63946',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>{pendingCount}</span>
              )}
            </Link>
            <Link to="/community" style={{ color: 'white', textDecoration: 'none' }}>Community</Link>
            {isAdmin && <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>}
            <button onClick={logout} style={{ backgroundColor: '#e63946', padding: '0.4rem 1rem', border: 'none', borderRadius: '30px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ backgroundColor: '#ffb703', padding: '0.4rem 1rem', borderRadius: '30px', color: '#1e3c32', fontWeight: 'bold', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
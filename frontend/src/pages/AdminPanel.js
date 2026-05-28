import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Panel</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>Total Listings: {stats.totalListings}</div>
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>Total Swaps: {stats.totalSwaps}</div>
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>Completed: {stats.completedSwaps}</div>
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>Users: {stats.totalUsers}</div>
      </div>
      <h3>Users</h3>
      <ul style={{ border: '1px solid #ddd', padding: '1rem' }}>
        {users.map(u => <li key={u.id}>{u.username} ({u.email}) - {u.isAdmin ? 'Admin' : 'User'}</li>)}
      </ul>
    </div>
  );
};

export default AdminPanel;
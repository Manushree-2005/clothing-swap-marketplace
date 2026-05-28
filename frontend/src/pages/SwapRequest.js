import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const SwapRequest = () => {
  const { id } = useParams();
  const [target, setTarget] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [selected, setSelected] = useState([]);
  const [valueWarning, setValueWarning] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const targetRes = await api.get(`/listings/${id}`);
      setTarget(targetRes.data);
      const myRes = await api.get('/my-listings');
      setMyListings(myRes.data.filter(l => l.status === 'available'));
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const offered = selected.reduce((sum, lid) => {
      const item = myListings.find(l => l.id === lid);
      return sum + (item?.estimatedValue || 0);
    }, 0);
    const targetValue = target?.estimatedValue || 0;
    if (offered && targetValue && Math.abs(offered - targetValue) / Math.max(offered, targetValue) > 0.3) {
      setValueWarning(`⚠️ Value imbalance: you offer $${offered}, they offer $${targetValue}. Add more items or negotiate.`);
    } else {
      setValueWarning('');
    }
  }, [selected, target, myListings]);

  const toggleSelect = (listingId) => {
    setSelected(prev => prev.includes(listingId) ? prev.filter(id => id !== listingId) : [...prev, listingId]);
  };

  const sendRequest = async () => {
    if (selected.length === 0) return alert('Select at least one of your items');
    const total = selected.reduce((sum, lid) => {
      const item = myListings.find(l => l.id === lid);
      return sum + (item?.estimatedValue || 0);
    }, 0);
    await api.post('/swaps', {
      receiverId: target.userId,
      requesterListingIds: selected,
      receiverListingIds: [target.id],
      requesterTotalValue: total,
      receiverTotalValue: target.estimatedValue
    });
    alert('Swap request sent!');
    navigate('/dashboard');
  };

  if (!target) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Propose a Swap</h2>
      <div style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '12px', background: '#f9f9f9' }}>
        <p><strong>You want:</strong> {target.brand} - {target.category} (Value: ${target.estimatedValue})</p>
      </div>
      <h3>Select your items to offer:</h3>
      {myListings.length === 0 && <p>You have no available listings. Create one from your Dashboard.</p>}
      {myListings.map(l => (
        <div key={l.id} style={{ border: '1px solid #ccc', marginBottom: '0.5rem', padding: '0.5rem', display: 'flex', justifyContent: 'space-between', borderRadius: '8px' }}>
          <span>{l.brand} - {l.category} (${l.estimatedValue})</span>
          <button onClick={() => toggleSelect(l.id)} style={{ backgroundColor: selected.includes(l.id) ? '#2d6a4f' : '#ccc', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '30px', cursor: 'pointer' }}>
            {selected.includes(l.id) ? 'Selected' : 'Select'}
          </button>
        </div>
      ))}
      {valueWarning && (
        <div style={{ backgroundColor: '#fff3cd', padding: '0.75rem', borderRadius: '8px', margin: '1rem 0' }}>
          {valueWarning}
          <button onClick={() => setSelected([])} style={{ marginLeft: '1rem', background: '#ffc107', border: 'none', borderRadius: '30px', padding: '0.2rem 0.8rem', cursor: 'pointer' }}>Clear selection</button>
        </div>
      )}
      <button onClick={sendRequest} style={{ width: '100%', backgroundColor: '#2d6a4f', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '30px', marginTop: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
        Send Swap Request
      </button>
    </div>
  );
};

export default SwapRequest;
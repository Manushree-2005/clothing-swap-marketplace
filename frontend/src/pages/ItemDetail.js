import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ItemDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchListing();
  }, [id]);

  if (!listing) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <img src={listing.images[0]} alt={listing.brand} style={{ width: '100%', borderRadius: '8px' }} />
      <h2>{listing.brand} - {listing.category}</h2>
      <p><strong>Size:</strong> {listing.size}</p>
      <p><strong>Condition:</strong> {listing.condition}</p>
      <p><strong>Description:</strong> {listing.description || 'No description'}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d6a4f' }}>${listing.estimatedValue}</p>
      <button onClick={() => navigate(`/swap/${listing.id}`)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Request Swap</button>
    </div>
  );
};

export default ItemDetail;
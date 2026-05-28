import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(50);
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        if (userLocation) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
          params.radius = radius;
        }
        const res = await api.get('/listings', { params });
        setListings(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [category, radius, userLocation]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  const filteredListings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return listings.filter(listing => {
      const matchesQuery = !query || [listing.brand, listing.category, listing.size, listing.condition, listing.location]
        .join(' ')
        .toLowerCase()
        .includes(query);
      const matchesCategory = !category || listing.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [listings, searchTerm, category]);

  const nearbyCount = listings.filter(listing => typeof listing.distance === 'number').length;

  if (loading) return <div className="spinner" style={{ margin: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <section style={{ background: 'linear-gradient(135deg, #effaf4 0%, #ffffff 100%)', borderRadius: '28px', padding: '1.5rem', boxShadow: '0 12px 30px rgba(45, 106, 79, 0.12)', marginBottom: '1.5rem' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.18em', color: '#2d6a4f', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Sustainable marketplace</p>
        <h1 style={{ marginTop: 0, color: '#1e3c32', fontSize: '2rem' }}>Swap smarter, wear longer, and reduce textile waste.</h1>
        <p style={{ color: '#456', maxWidth: '900px' }}>Browse nearby listings, estimate fair swap value, and connect with eco-conscious users in your area.</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {['Nearby matches', 'Fair value tips', 'Community swaps'].map(tag => (
            <span key={tag} style={{ background: '#e8f5e9', color: '#2d6a4f', borderRadius: '999px', padding: '0.35rem 0.75rem', fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          ['Listings', listings.length],
          ['Available now', listings.filter(item => item.status !== 'swapped').length],
          ['Nearby', nearbyCount],
          ['Search matches', filteredListings.length]
        ].map(([label, value]) => (
          <article key={label} style={{ background: 'white', borderRadius: '18px', padding: '1rem', boxShadow: '0 8px 18px rgba(0,0,0,0.08)' }}>
            <div style={{ color: '#2d6a4f', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1e3c32' }}>{value}</div>
          </article>
        ))}
      </div>
      
      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search brand, category, size or location"
          style={{ minWidth: '280px', padding: '0.6rem 1rem', borderRadius: '30px', border: '1px solid #cfe4da' }}
        />
        <select 
          value={category} 
          onChange={e => setCategory(e.target.value)} 
          style={{ padding: '0.5rem 1rem', borderRadius: '30px', border: '1px solid #ccc' }}
        >
          <option value="">All Categories</option>
          <option value="Shirt">👕 Shirts</option>
          <option value="Pants">👖 Pants</option>
          <option value="Jacket">🧥 Jackets</option>
          <option value="Dress">👗 Dresses</option>
          <option value="Shoes">👟 Shoes</option>
          <option value="Accessories">💍 Accessories</option>
        </select>
        
        <button onClick={getLocation} style={{ backgroundColor: '#2d6a4f', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '30px', cursor: 'pointer' }}>
          📍 Use My Location
        </button>
        
        {userLocation && (
          <select value={radius} onChange={e => setRadius(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '30px', border: '1px solid #ccc' }}>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
            <option value="100">Within 100 km</option>
          </select>
        )}
        <button onClick={() => { setSearchTerm(''); setCategory(''); }} style={{ backgroundColor: '#1d3557', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '30px', cursor: 'pointer' }}>
          Clear filters
        </button>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '24px' }}>
          <p>No listings found.</p>
          {localStorage.getItem('token') ? (
            <p>Go to <a href="/dashboard">Dashboard</a> and add some clothes to swap!</p>
          ) : (
            <p>Please <a href="/login">login</a> to add listings.</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {filteredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Listings;
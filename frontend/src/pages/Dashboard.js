import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Simple inline toast (you can replace with a library later)
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px',
      background: type === 'error' ? '#e63946' : '#2d6a4f',
      color: 'white', padding: '12px 24px', borderRadius: '40px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000
    }}>
      {message}
    </div>
  );
};

// Reusable Listing Card Component
const ListingCard = ({ listing, onDelete, isDeleting }) => {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <img src={listing.images[0]} alt={listing.brand} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px' }} />
      <div style={{ marginTop: '0.75rem' }}>
        <strong>{listing.brand}</strong> - {listing.category}<br />
        Size: {listing.size} | Condition: {listing.condition}<br />
        Status: <span style={{ color: listing.status === 'available' ? '#2d6a4f' : '#e63946', fontWeight: 'bold' }}>{listing.status}</span>
      </div>
      <button
        onClick={() => onDelete(listing.id)}
        disabled={isDeleting}
        style={{
          backgroundColor: '#e63946', color: 'white', border: 'none',
          padding: '0.4rem', borderRadius: '30px', width: '100%',
          marginTop: '0.75rem', cursor: isDeleting ? 'not-allowed' : 'pointer',
          opacity: isDeleting ? 0.6 : 1
        }}
      >
        {isDeleting ? 'Deleting...' : '🗑 Delete'}
      </button>
    </div>
  );
};

const Dashboard = () => {
  const [myListings, setMyListings] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newListing, setNewListing] = useState({
    images: [], category: 'Shirt', brand: '', size: 'M',
    condition: 'Like new', estimatedValue: 25, description: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionInProgress, setActionInProgress] = useState({ delete: false, accept: false, complete: false });
  const userId = localStorage.getItem('userId');

  const showToast = (message, type = 'success') => setToast({ message, type });
  const clearToast = () => setToast(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [listingsRes, swapsRes] = await Promise.all([
        api.get('/my-listings'),
        api.get('/swaps')
      ]);
      setMyListings(listingsRes.data);
      setSwaps(swapsRes.data);
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Eco stats
  const completedSwaps = swaps.filter(s => s.status === 'completed');
  const waterSaved = completedSwaps.length * 2700;
  const co2Saved = completedSwaps.length * 5;

  // Delete listing
  const deleteListing = async (listingId) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    setActionInProgress(prev => ({ ...prev, delete: true }));
    try {
      await api.delete(`/listings/${listingId}`);
      showToast('Listing deleted');
      await fetchData();
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    } finally {
      setActionInProgress(prev => ({ ...prev, delete: false }));
    }
  };

  // Value calculator
  const fetchSuggestedValue = async (category, brand, condition) => {
    try {
      const res = await api.get(`/calculate-value?category=${category}&brand=${brand}&condition=${condition}`);
      setNewListing(prev => ({ ...prev, estimatedValue: res.data.estimated }));
    } catch (err) {
      console.error('Value fetch failed', err);
    }
  };

  // Image handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewListing({ ...newListing, images: [reader.result] });
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    setNewListing({ ...newListing, [e.target.name]: e.target.value });
  };

  const createListing = async (e) => {
    e.preventDefault();
    if (!newListing.brand.trim()) {
      showToast('Brand name is required', 'error');
      return;
    }
    setActionInProgress(prev => ({ ...prev, create: true }));
    try {
      await api.post('/listings', newListing);
      showToast('Listing created!');
      setShowForm(false);
      setNewListing({
        images: [], category: 'Shirt', brand: '', size: 'M',
        condition: 'Like new', estimatedValue: 25, description: ''
      });
      setImagePreview(null);
      await fetchData();
    } catch (err) {
      showToast('Failed to create: ' + err.message, 'error');
    } finally {
      setActionInProgress(prev => ({ ...prev, create: false }));
    }
  };

  const clothingImageMap = {
    Shirt: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    Pants: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    Jacket: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    Dress: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    Shoes: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    Accessories: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80'
  };

  const addDemoListing = async () => {
    const category = ['Shirt','Pants','Jacket','Dress'][Math.floor(Math.random()*4)];
    const demo = {
      images: [clothingImageMap[category]],
      category,
      brand: ['Nike','Adidas','Zara',"Levi's"][Math.floor(Math.random()*4)],
      size: ['S','M','L','XL'][Math.floor(Math.random()*4)],
      condition: ['Like new','Gently used','New with tags'][Math.floor(Math.random()*3)],
      estimatedValue: Math.floor(Math.random()*80)+20,
    };
    setActionInProgress(prev => ({ ...prev, demo: true }));
    try {
      await api.post('/listings', demo);
      showToast('Demo listing added');
      await fetchData();
    } catch (err) {
      showToast('Failed to add demo', 'error');
    } finally {
      setActionInProgress(prev => ({ ...prev, demo: false }));
    }
  };

  const acceptSwap = async (swapId) => {
    if (!window.confirm('Accept this swap request?')) return;
    setActionInProgress(prev => ({ ...prev, accept: true }));
    try {
      await api.post(`/swaps/${swapId}/accept`);
      showToast('Swap accepted');
      await fetchData();
    } catch (err) {
      showToast('Accept failed: ' + err.message, 'error');
    } finally {
      setActionInProgress(prev => ({ ...prev, accept: false }));
    }
  };

  const completeSwap = async (swapId) => {
    if (!window.confirm('Mark this swap as completed?')) return;
    setActionInProgress(prev => ({ ...prev, complete: true }));
    try {
      await api.post(`/swaps/${swapId}/complete`);
      showToast('Swap completed!');
      await fetchData();
    } catch (err) {
      showToast('Completion failed: ' + err.message, 'error');
    } finally {
      setActionInProgress(prev => ({ ...prev, complete: false }));
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your dashboard...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e3c32' }}>My Dashboard</h1>
        <div>
          <button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#2d6a4f', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '30px', marginRight: '1rem', cursor: 'pointer' }}>
            📸 {showForm ? 'Close Form' : 'Add Listing with Photo'}
          </button>
          <button onClick={addDemoListing} disabled={actionInProgress.demo} style={{ backgroundColor: '#1d3557', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '30px', cursor: 'pointer', opacity: actionInProgress.demo ? 0.6 : 1 }}>
            {actionInProgress.demo ? 'Adding...' : '⚡ Add Demo Listing'}
          </button>
        </div>
      </div>

      {/* Eco Impact Tracker */}
      <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', textAlign: 'center' }}>
        <div><strong>♻️ Completed swaps</strong><br/>{completedSwaps.length}</div>
        <div><strong>💧 Water saved</strong><br/>{waterSaved.toLocaleString()} litres</div>
        <div><strong>🌬️ CO₂ avoided</strong><br/>{co2Saved.toLocaleString()} kg</div>
        <div><strong>👕 Items listed</strong><br/>{myListings.length}</div>
      </div>

      {/* Create Listing Form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h3>Create New Listing with Your Photo</h3>
          <form onSubmit={createListing}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Upload Photo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required />
              {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100px', marginTop: '0.5rem', borderRadius: '8px' }} />}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input type="text" name="brand" placeholder="Brand *" value={newListing.brand} onChange={handleInputChange} required style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
              <select name="category" value={newListing.category} onChange={(e) => {
                handleInputChange(e);
                fetchSuggestedValue(e.target.value, newListing.brand, newListing.condition);
              }} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option>Shirt</option><option>Pants</option><option>Jacket</option><option>Dress</option><option>Shoes</option><option>Accessories</option>
              </select>
              <select name="size" value={newListing.size} onChange={handleInputChange} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option>
              </select>
              <select name="condition" value={newListing.condition} onChange={(e) => {
                handleInputChange(e);
                fetchSuggestedValue(newListing.category, newListing.brand, e.target.value);
              }} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option>New with tags</option><option>Like new</option><option>Gently used</option><option>Visible wear</option>
              </select>
              <input type="number" name="estimatedValue" placeholder="Estimated Value ($)" value={newListing.estimatedValue} onChange={handleInputChange} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
              <textarea name="description" placeholder="Description" value={newListing.description} onChange={handleInputChange} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#2d6a4f', marginTop: '0.5rem' }}>💡 Suggested value based on brand, category & condition. You can adjust.</p>
            <button type="submit" disabled={actionInProgress.create} style={{ marginTop: '1rem', backgroundColor: '#2d6a4f', color: 'white', padding: '0.5rem 1.5rem', border: 'none', borderRadius: '30px', cursor: 'pointer', opacity: actionInProgress.create ? 0.6 : 1 }}>
              {actionInProgress.create ? 'Creating...' : '✓ Create Listing'}
            </button>
          </form>
        </div>
      )}

      {/* My Listings */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ borderLeft: '4px solid #2d6a4f', paddingLeft: '1rem' }}>My Listings ({myListings.length})</h2>
        {myListings.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', background: '#f9f9f9', borderRadius: '16px' }}>You haven't listed any items yet. Click "Add Listing" above to get started.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {myListings.map(l => (
              <ListingCard key={l.id} listing={l} onDelete={deleteListing} isDeleting={actionInProgress.delete} />
            ))}
          </div>
        )}
      </div>

      {/* Swap Requests */}
      <div>
        <h2 style={{ borderLeft: '4px solid #2d6a4f', paddingLeft: '1rem' }}>Swap Requests</h2>
        {swaps.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', background: '#f9f9f9', borderRadius: '16px' }}>No swap requests yet. Browse listings and send a swap request!</p>
        ) : (
          swaps.map(swap => (
            <div key={swap.id} style={{ background: 'white', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <p>Swap #{swap.id} - Status: <strong>{swap.status}</strong></p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {swap.status === 'pending' && swap.receiverId === Number(userId) && (
                  <button onClick={() => acceptSwap(swap.id)} disabled={actionInProgress.accept} style={{ backgroundColor: '#2d6a4f', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', opacity: actionInProgress.accept ? 0.6 : 1 }}>
                    {actionInProgress.accept ? 'Accepting...' : 'Accept'}
                  </button>
                )}
                {swap.status === 'accepted' && (
                  <button onClick={() => completeSwap(swap.id)} disabled={actionInProgress.complete} style={{ backgroundColor: '#ffb703', border: 'none', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', opacity: actionInProgress.complete ? 0.6 : 1 }}>
                    {actionInProgress.complete ? 'Completing...' : 'Mark Completed'}
                  </button>
                )}
                <button onClick={() => window.location.href = `/chat/${swap.id}`} style={{ backgroundColor: '#1d3557', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer' }}>Chat</button>
              </div>

              {/* Courier Integration (only for accepted swaps) */}
              {swap.status === 'accepted' && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#e8f5e9', borderRadius: '12px' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>📦 Remote swap? Arrange shipping:</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => window.open('https://www.sendle.com/quote', '_blank')} style={{ background: '#2d6a4f', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '20px', cursor: 'pointer' }}>Sendle Quote</button>
                    <button onClick={() => window.open('https://www.usps.com/ship/online-shipping.htm', '_blank')} style={{ background: '#2d6a4f', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '20px', cursor: 'pointer' }}>USPS Click-N-Ship</button>
                    <button onClick={() => window.open('https://www.ups.com/us/en/shipping.page', '_blank')} style={{ background: '#2d6a4f', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '20px', cursor: 'pointer' }}>UPS</button>
                  </div>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>💡 Estimate cost ~ ${(swap.requesterTotalValue * 0.05).toFixed(2)} (based on item value).</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
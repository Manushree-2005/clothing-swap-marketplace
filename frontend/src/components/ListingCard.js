// frontend/src/components/ListingCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const fallbackImages = {
  Shirt: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  Pants: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
  Jacket: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
  Dress: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
  Shoes: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
  Accessories: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80'
};

const ListingCard = ({ listing }) => {
  const imageUrl = listing.images?.[0] || fallbackImages[listing.category] || fallbackImages.Shirt;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <img src={imageUrl} alt={listing.brand} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.25rem' }}>{listing.brand}</h3>
        <p style={{ margin: '0', color: '#555' }}>{listing.category} - {listing.size}</p>
        <p style={{ fontWeight: 'bold', color: '#2d6a4f', margin: '0.5rem 0' }}>${listing.estimatedValue}</p>
        {listing.distance && (
          <p style={{ fontSize: '0.8rem', color: '#2d6a4f', margin: '0 0 0.5rem' }}>
            📍 {listing.distance.toFixed(1)} km away
          </p>
        )}
        <Link
          to={`/item/${listing.id}`}
          style={{
            display: 'block',
            backgroundColor: '#1d3557',
            color: 'white',
            textAlign: 'center',
            padding: '0.6rem',
            borderRadius: '30px',
            textDecoration: 'none',
            marginTop: '0.5rem'
          }}
        >
          Swap Request
        </Link>
      </div>
    </div>
  );
};

export default ListingCard;
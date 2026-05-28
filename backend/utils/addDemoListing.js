// Run this function from the browser console or import it
export async function addDemoListing() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Please login first');
    return;
  }
  const sample = {
    images: ['https://via.placeholder.com/300'],
    category: 'Shirt',
    brand: 'Nike',
    size: 'M',
    condition: 'Like new',
    estimatedValue: 35,
    description: 'Running shirt',
    location: { city: 'Your City' }
  };
  try {
    const res = await fetch('http://localhost:5000/api/listings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(sample)
    });
    const data = await res.json();
    console.log('✅ Created:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

// Optional: auto-run if you load this script directly
// addDemoListing();

// Run this function from the browser console to populate your marketplace with sample listings
// Usage: In browser console (F12), type: seedListings()

export async function seedListings() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Please login first');
    alert('Please login first before adding listings');
    return;
  }

  const sampleItems = [
    { brand: "Nike", category: "Shirt", size: "M", condition: "Like new", value: 35 },
    { brand: "Levi's", category: "Jeans", size: "32", condition: "Gently used", value: 45 },
    { brand: "Zara", category: "Dress", size: "S", condition: "New with tags", value: 55 },
    { brand: "Adidas", category: "Shoes", size: "9", condition: "Like new", value: 40 },
    { brand: "The North Face", category: "Jacket", size: "L", condition: "Gently used", value: 80 }
  ];

  for (let item of sampleItems) {
    try {
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          images: [`https://picsum.photos/300/200?random=${Math.random()}`],
          category: item.category,
          brand: item.brand,
          size: item.size,
          condition: item.condition,
          estimatedValue: item.value,
          description: `Beautiful ${item.category} from ${item.brand}`
        })
      });
      if (response.ok) {
        console.log(`✅ Added ${item.brand} ${item.category}`);
      } else {
        console.error(`❌ Failed to add ${item.brand} ${item.category}`);
      }
    } catch (err) {
      console.error('Network error:', err);
    }
  }
  console.log('🎉 Done! Refresh the page to see your listings.');
}

// For quick console access, you can also attach to window
if (typeof window !== 'undefined') {
  window.seedListings = seedListings;
  console.log('💡 Type "seedListings()" in the console to add sample items');
}
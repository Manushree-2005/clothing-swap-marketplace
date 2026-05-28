const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ---------- Persistent File Storage ----------
const DB_PATH = path.join(__dirname, 'database.json');

let db = {
  users: [],
  listings: [],
  swaps: [],
  posts: [],
  nextUserId: 1,
  nextListingId: 1,
  nextSwapId: 1,
  nextPostId: 1
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      const loaded = JSON.parse(data);
      db = { ...db, ...loaded };
      console.log('✅ Database loaded from file');
    } else {
      console.log('📁 No existing database file, starting fresh');
    }
  } catch (err) {
    console.error('Error loading database:', err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log('💾 Database saved');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

loadDatabase();

// Helper: distance between two lat/lng (Haversine)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, 'secretkey123');
    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch { res.status(403).json({ error: 'Invalid token' }); }
};

// Helper for average rating
const getAverageRating = (user) => {
  if (!user.ratings || user.ratings.length === 0) return 0;
  const sum = user.ratings.reduce((acc, r) => acc + r.rating, 0);
  return (sum / user.ratings.length).toFixed(1);
};

// ---------- Routes ----------
app.get('/', (req, res) => res.send('Clothing Swap API running (persistent storage)'));

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, city, lat, lng } = req.body;
  if (!username || !email || !password || !city)
    return res.status(400).json({ error: 'All fields required' });
  if (db.users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email exists' });
  const hashed = await bcrypt.hash(password, 10);
  const newUser = {
    id: db.nextUserId++,
    username, email, password: hashed, city,
    lat: lat || 0, lng: lng || 0,
    isAdmin: email === 'admin@example.com',
    ratings: [],
    wishlist: []
  };
  db.users.push(newUser);
  saveDatabase();
  res.status(201).json({ message: 'User created', userId: newUser.id });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'secretkey123', { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username, isAdmin: user.isAdmin, lat: user.lat, lng: user.lng, city: user.city } });
});

// Listings
app.get('/api/listings', (req, res) => {
  let { lat, lng, radius = 50, category } = req.query;
  let filtered = db.listings.filter(l => l.status === 'available');
  if (category) filtered = filtered.filter(l => l.category === category);
  if (lat && lng) {
    filtered = filtered.map(l => ({
      ...l,
      distance: getDistance(parseFloat(lat), parseFloat(lng), l.location.lat, l.location.lng)
    })).filter(l => l.distance <= radius).sort((a,b) => a.distance - b.distance);
  }
  res.json(filtered);
});

app.get('/api/listings/:id', (req, res) => {
  const listing = db.listings.find(l => l.id == req.params.id);
  listing ? res.json(listing) : res.status(404).json({ error: 'Not found' });
});

app.post('/api/listings', auth, (req, res) => {
  const { images, category, brand, size, condition, estimatedValue, description, location } = req.body;
  const newListing = {
    id: db.nextListingId++,
    userId: req.userId,
    images: images || ['https://picsum.photos/300/200'],
    category: category || 'Other',
    brand: brand || 'Unknown',
    size: size || 'M',
    condition: condition || 'Gently used',
    estimatedValue: estimatedValue || 25,
    description: description || '',
    location: location || { city: 'Unknown', lat: 0, lng: 0 },
    status: 'available'
  };
  db.listings.push(newListing);
  saveDatabase();
  res.status(201).json(newListing);
});

app.get('/api/my-listings', auth, (req, res) => {
  res.json(db.listings.filter(l => l.userId === req.userId));
});

app.delete('/api/listings/:id', auth, (req, res) => {
  const listingId = parseInt(req.params.id);
  const index = db.listings.findIndex(l => l.id === listingId);
  if (index === -1) return res.status(404).json({ error: 'Listing not found' });
  if (db.listings[index].userId !== req.userId) return res.status(403).json({ error: 'Only owner can delete' });
  db.listings.splice(index, 1);
  saveDatabase();
  res.json({ message: 'Deleted' });
});

// Swaps
app.post('/api/swaps', auth, (req, res) => {
  const { receiverId, requesterListingIds, receiverListingIds, requesterTotalValue, receiverTotalValue } = req.body;
  const newSwap = {
    id: db.nextSwapId++,
    requesterId: req.userId,
    receiverId,
    requesterListingIds,
    receiverListingIds,
    requesterTotalValue,
    receiverTotalValue,
    status: 'pending',
    chat: []
  };
  db.swaps.push(newSwap);
  [...requesterListingIds, ...receiverListingIds].forEach(id => {
    const listing = db.listings.find(l => l.id == id);
    if (listing) listing.status = 'pending';
  });
  saveDatabase();
  res.status(201).json(newSwap);
});

app.get('/api/swaps', auth, (req, res) => {
  res.json(db.swaps.filter(s => s.requesterId === req.userId || s.receiverId === req.userId));
});

app.post('/api/swaps/:id/accept', auth, (req, res) => {
  const swap = db.swaps.find(s => s.id == req.params.id);
  if (!swap) return res.status(404).json({ error: 'Not found' });
  if (swap.receiverId !== req.userId) return res.status(403).json({ error: 'Not authorized' });
  swap.status = 'accepted';
  saveDatabase();
  res.json(swap);
});

app.post('/api/swaps/:id/complete', auth, (req, res) => {
  const swap = db.swaps.find(s => s.id == req.params.id);
  if (!swap || swap.status !== 'accepted') return res.status(400).json({ error: 'Invalid' });
  swap.status = 'completed';
  [...swap.requesterListingIds, ...swap.receiverListingIds].forEach(id => {
    const l = db.listings.find(l => l.id == id);
    if (l) l.status = 'swapped';
  });
  saveDatabase();
  res.json(swap);
});

// Counter-offer
app.put('/api/swaps/:id/counter', auth, (req, res) => {
  const swap = db.swaps.find(s => s.id == parseInt(req.params.id));
  if (!swap) return res.status(404).json({ error: 'Swap not found' });
  if (swap.status !== 'pending') return res.status(400).json({ error: 'Only pending swaps can be countered' });
  if (swap.receiverId !== req.userId) return res.status(403).json({ error: 'Only the receiver can counter' });
  const { requesterListingIds, receiverListingIds, requesterTotalValue, receiverTotalValue } = req.body;
  swap.requesterListingIds = requesterListingIds;
  swap.receiverListingIds = receiverListingIds;
  swap.requesterTotalValue = requesterTotalValue;
  swap.receiverTotalValue = receiverTotalValue;
  swap.chat.push({
    senderId: req.userId,
    message: `📝 Counter‑offer sent. New values: $${requesterTotalValue} ↔ $${receiverTotalValue}. Please accept or counter again.`,
    timestamp: new Date()
  });
  saveDatabase();
  res.json(swap);
});

// Chat
app.post('/api/chat/:swapId', auth, (req, res) => {
  const swap = db.swaps.find(s => s.id == req.params.swapId);
  if (!swap) return res.status(404).json({ error: 'Swap not found' });
  swap.chat.push({ senderId: req.userId, message: req.body.message, timestamp: new Date() });
  saveDatabase();
  res.json({ success: true });
});

app.get('/api/chat/:swapId', auth, (req, res) => {
  const swap = db.swaps.find(s => s.id == req.params.swapId);
  if (!swap) return res.status(404).json({ error: 'Not found' });
  res.json(swap.chat);
});

// Value calculator
app.get('/api/calculate-value', (req, res) => {
  const { category, brand, condition } = req.query;
  const categoryBase = { Shirt:20, Pants:30, Jacket:45, Dress:35, Shoes:25, Accessories:15 };
  const brandMulti = { Nike:1.2, Adidas:1.2, Zara:1.0, "Levi's":1.3, Luxury:2.0, Premium:1.5, Mid:1.0, "Fast Fashion":0.7 };
  const conditionMulti = { "New with tags":1.0, "Like new":0.85, "Gently used":0.7, "Visible wear":0.5 };
  const base = categoryBase[category] || 20;
  const brandVal = brandMulti[brand] || 1.0;
  const condVal = conditionMulti[condition] || 0.7;
  const estimated = Math.round(base * brandVal * condVal);
  res.json({ estimated });
});

// Ratings
app.post('/api/ratings', auth, (req, res) => {
  const { swapId, rating, comment } = req.body;
  const swap = db.swaps.find(s => s.id === parseInt(swapId));
  if (!swap || swap.status !== 'completed') return res.status(400).json({ error: 'Swap not completed' });
  const ratedUserId = swap.requesterId === req.userId ? swap.receiverId : swap.requesterId;
  const ratedUser = db.users.find(u => u.id === ratedUserId);
  if (!ratedUser) return res.status(404).json({ error: 'User not found' });
  ratedUser.ratings = ratedUser.ratings || [];
  const alreadyRated = ratedUser.ratings.some(r => r.swapId === swap.id && r.fromUserId === req.userId);
  if (alreadyRated) return res.status(400).json({ error: 'Already rated' });
  ratedUser.ratings.push({ fromUserId: req.userId, swapId: swap.id, rating: parseInt(rating), comment: comment || '', date: new Date() });
  saveDatabase();
  res.json({ message: 'Rating submitted', average: getAverageRating(ratedUser) });
});

app.get('/api/users/:id/rating', (req, res) => {
  const user = db.users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ average: getAverageRating(user), count: user.ratings?.length || 0, ratings: user.ratings || [] });
});

// Wishlist
app.post('/api/wishlist/:listingId', auth, (req, res) => {
  const listingId = parseInt(req.params.listingId);
  const user = db.users.find(u => u.id === req.userId);
  user.wishlist = user.wishlist || [];
  if (!user.wishlist.includes(listingId)) user.wishlist.push(listingId);
  saveDatabase();
  res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
});

app.delete('/api/wishlist/:listingId', auth, (req, res) => {
  const listingId = parseInt(req.params.listingId);
  const user = db.users.find(u => u.id === req.userId);
  user.wishlist = (user.wishlist || []).filter(id => id !== listingId);
  saveDatabase();
  res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
});

app.get('/api/wishlist', auth, (req, res) => {
  const user = db.users.find(u => u.id === req.userId);
  const wishlistItems = (user.wishlist || []).map(id => db.listings.find(l => l.id === id)).filter(l => l);
  res.json(wishlistItems);
});

// Recommendations (category-based)
app.get('/api/recommendations/:listingId', (req, res) => {
  const listingId = parseInt(req.params.listingId);
  const listing = db.listings.find(l => l.id === listingId);
  if (!listing) return res.status(404).json({ error: 'Not found' });
  const recommendations = db.listings.filter(l => l.category === listing.category && l.id !== listingId && l.status === 'available').slice(0, 4);
  res.json(recommendations);
});

// Community posts
app.post('/api/community/posts', auth, (req, res) => {
  const { title, content, image } = req.body;
  const user = db.users.find(u => u.id === req.userId);
  const newPost = {
    id: db.nextPostId++,
    userId: req.userId,
    username: user?.username || 'Anonymous',
    title: title || 'Swap story',
    content,
    image: image || null,
    likes: 0,
    comments: [],
    createdAt: new Date()
  };
  db.posts.unshift(newPost);
  saveDatabase();
  res.status(201).json(newPost);
});

app.get('/api/community/posts', (req, res) => {
  res.json(db.posts);
});

app.post('/api/community/posts/:id/like', auth, (req, res) => {
  const post = db.posts.find(p => p.id == req.params.id);
  if (post) post.likes += 1;
  saveDatabase();
  res.json({ likes: post?.likes || 0 });
});

// Admin
app.get('/api/admin/users', auth, (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: 'Admin only' });
  res.json(db.users);
});

app.get('/api/admin/stats', auth, (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: 'Admin only' });
  res.json({
    totalListings: db.listings.length,
    totalSwaps: db.swaps.length,
    completedSwaps: db.swaps.filter(s => s.status === 'completed').length,
    totalUsers: db.users.length
  });
});

app.delete('/api/admin/listings/:id', auth, (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const index = db.listings.findIndex(l => l.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  db.listings.splice(index, 1);
  saveDatabase();
  res.json({ message: 'Listing removed' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT} (persistent storage)`));
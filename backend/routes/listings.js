// Get listings near user (using Haversine formula in MongoDB aggregation)
router.get('/', async (req, res) => {
  const { lat, lng, radius = 50 } = req.query;
  const listings = await Listing.aggregate([
    { $geoNear: { near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, distanceField: 'distance', maxDistance: radius * 1000 } },
    { $match: { status: 'available' } },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } }
  ]);
  res.json(listings);
});
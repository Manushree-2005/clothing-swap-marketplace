const categoryBase = { Shirt: 20, Pants: 30, Jacket: 45, Dress: 35, Shoes: 25, Accessories: 15 };
const brandMultiplier = { Luxury: 2.2, Premium: 1.5, Mid: 1.0, 'Fast Fashion': 0.7 };
const conditionMultiplier = { 'New with tags': 1.0, 'Like new': 0.85, 'Gently used': 0.7, 'Visible wear': 0.5 };

function calculateValue(category, brandTier, condition) {
  const base = categoryBase[category] || 20;
  const brand = brandMultiplier[brandTier] || 1.0;
  const cond = conditionMultiplier[condition] || 0.7;
  return Math.round(base * brand * cond);
}

module.exports = calculateValue;
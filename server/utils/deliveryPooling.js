const DeliveryPool = require('../models/DeliveryPool');

// Find or create delivery pool for an area
const findOrCreateDeliveryPool = async (area) => {
  try {
    // Look for existing forming pool in the same area
    let deliveryPool = await DeliveryPool.findOne({
      area: area,
      status: 'forming'
    });

    if (!deliveryPool) {
      // Create new delivery pool
      deliveryPool = new DeliveryPool({
        area: area,
        totalDeliveryFee: 50, // Base delivery fee
        feePerOrder: 50, // Initially full fee
        orders: []
      });
      await deliveryPool.save();
    } else {
      // Update fee per order based on current orders
      const orderCount = deliveryPool.orders.length + 1; // +1 for new order
      deliveryPool.feePerOrder = Math.ceil(deliveryPool.totalDeliveryFee / orderCount);
      await deliveryPool.save();
    }

    return deliveryPool;
  } catch (error) {
    console.error('Error in delivery pooling:', error);
    return null;
  }
};

// Calculate delivery savings
const calculateDeliverySavings = (originalFee, poolFee) => {
  return originalFee - poolFee;
};

// Check if delivery pool should be activated
const activatePoolIfReady = async (poolId) => {
  try {
    const pool = await DeliveryPool.findById(poolId);
    
    if (pool && pool.orders.length >= 2) {
      pool.status = 'active';
      await pool.save();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error activating pool:', error);
    return false;
  }
};

// Simulate area matching (simplified)
const getAreaFromAddress = (address) => {
  // In a real app, this would use geocoding or postal codes
  // For demo, we'll use a simple string match on city/pincode
  if (address.pincode) {
    return address.pincode.substring(0, 3); // Group by first 3 digits of pincode
  }
  return address.city || 'default-area';
};

module.exports = {
  findOrCreateDeliveryPool,
  calculateDeliverySavings,
  activatePoolIfReady,
  getAreaFromAddress
};

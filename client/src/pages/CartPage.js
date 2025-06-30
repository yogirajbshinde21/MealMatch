import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { orderService } from '../services/api';

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, clearCart, getTotalPrice, loading } = useCart();
  const { user } = useAuth();
  const { applyWeatherPricing } = useWeather();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItem(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setCheckoutError('Please login to place an order');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      setCheckoutError('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setCheckoutError('');

    try {
      console.log('Starting checkout process...');
      console.log('User:', user);
      console.log('Cart items:', cart.items);
      
      // Validate cart items
      if (!cart.items.every(item => item.meal && item.meal._id)) {
        throw new Error('Invalid cart items: missing meal data');
      }

      // Generate ETA based on user type
      const isDemo = user.email === 'demo@mealmatch.com';
      const etaMinutes = isDemo ? 1 : Math.floor(Math.random() * (45 - 25 + 1)) + 25; // 25-45 minutes for regular users, 1 minute for demo
      const estimatedDeliveryTime = new Date(Date.now() + etaMinutes * 60 * 1000);

      // Prepare order data
      const orderData = {
        userId: user.id,
        items: cart.items.map(item => ({
          meal: item.meal._id,
          quantity: item.quantity,
          price: item.bargainPrice || item.meal.price,
          bargainPrice: item.bargainPrice || null
        })),
        totalAmount: finalAmount,
        deliveryFee: deliveryFee,
        deliveryAddress: {
          street: user.address?.street || '123 Default Street',
          city: user.address?.city || user.city || 'Mumbai',
          pincode: user.address?.pincode || '400001'
        },
        orderStatus: 'Placed',
        orderPlacedTime: new Date(),
        estimatedDeliveryTime: estimatedDeliveryTime,
        estimatedDeliveryMinutes: etaMinutes,
        status: 'placed'
      };

      console.log('Order data prepared:', orderData);

      // Create order
      const response = await orderService.createOrder(orderData);
      console.log('Order created successfully:', response);
      
      // For mock users, store order in localStorage with complete meal data
      if (user.id.startsWith('user-') || user.id.startsWith('demo-') || user.id.startsWith('admin-')) {
        const order = response.data.order;
        console.log('Storing mock order in localStorage:', order);
        
        // Enhance the order with complete meal data from cart
        const enhancedOrder = {
          ...order,
          items: order.items.map((orderItem, index) => {
            const cartItem = cart.items[index];
            return {
              ...orderItem,
              meal: {
                _id: cartItem.meal._id,
                name: cartItem.meal.name,
                image: cartItem.meal.image,
                price: cartItem.meal.price,
                restaurant: cartItem.meal.restaurant,
                category: cartItem.meal.category,
                isVeg: cartItem.meal.isVeg
              }
            };
          })
        };
        
        // Get existing orders from localStorage
        const existingOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`) || '[]');
        
        // Add new order to the beginning of the array
        existingOrders.unshift(enhancedOrder);
        
        // Store updated orders
        localStorage.setItem(`orders_${user.id}`, JSON.stringify(existingOrders));
        console.log('Enhanced order stored in localStorage');
      }
      
      // Clear cart after successful order
      await clearCart();

      // Show success message and redirect to orders
      alert('🎉 Order placed successfully! You can track it in your order history.');
      navigate('/orders');

    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const deliveryFee = 50;
  const totalAmount = getTotalPrice();
  const finalAmount = totalAmount + deliveryFee;

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading cart...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container py-5">
        <div className="empty-state">
          <i className="bi bi-cart-x" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
          <h3 className="mt-3">Your cart is empty</h3>
          <p className="text-muted">Looks like you haven't added any meals to your cart yet.</p>
          <Link to="/dashboard" className="btn btn-primary">
            <i className="bi bi-shop me-2"></i>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="display-6 fw-bold primary-text">
              <i className="bi bi-cart3 me-2"></i>
              Your Cart
            </h1>
            <p className="text-muted">
              Review your items and proceed to checkout
            </p>
          </div>
        </div>

        <div className="row">
          {/* Cart Items */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Cart Items ({cart.items.length})</h5>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={clearCart}
                  disabled={loading}
                >
                  <i className="bi bi-trash me-1"></i>
                  Clear Cart
                </button>
              </div>
              <div className="card-body p-0">
                {cart.items.map((item, index) => (
                  <div key={item._id} className="cart-item">
                    <div className="row align-items-center p-3">
                      {/* Meal Image */}
                      <div className="col-md-2">
                        <img
                          src={item.meal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                          alt={item.meal.name}
                          className="img-fluid rounded"
                          style={{ height: '80px', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Meal Details */}
                      <div className="col-md-4">
                        <h6 className="fw-bold mb-1">{item.meal.name}</h6>
                        <p className="text-muted small mb-1">
                          {item.meal.restaurant?.name || 'Restaurant'}
                        </p>
                        {item.bargainPrice && (
                          <span className="badge bg-success">
                            <i className="bi bi-currency-dollar me-1"></i>
                            Bargain Price
                          </span>
                        )}
                        {item.meal.isVeg && (
                          <span className="badge bg-success ms-1">
                            <i className="bi bi-circle-fill"></i> Veg
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="col-md-2 text-center">
                        {(() => {
                          // Calculate current weather-adjusted price for display
                          const basePrice = item.meal.price;
                          const weatherPricing = applyWeatherPricing(basePrice);
                          const currentPrice = item.bargainPrice || weatherPricing.finalPrice;
                          const showWeatherDiscount = !item.bargainPrice && weatherPricing.hasDiscount;
                          
                          return (
                            <div>
                              <div className="price-tag primary-text fw-bold">
                                ₹{Math.round(currentPrice)}
                              </div>
                              {item.bargainPrice ? (
                                <div className="text-muted text-decoration-line-through small">
                                  ₹{basePrice}
                                </div>
                              ) : showWeatherDiscount ? (
                                <div className="text-muted text-decoration-line-through small">
                                  ₹{basePrice}
                                </div>
                              ) : null}
                              {item.bargainPrice && (
                                <small className="text-success d-block">Bargain Price</small>
                              )}
                              {showWeatherDiscount && (
                                <small className="text-info d-block">Weather Discount</small>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Quantity Controls */}
                      <div className="col-md-2">
                        <div className="d-flex align-items-center justify-content-center">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={loading}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="mx-3 fw-bold">{item.quantity}</span>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={loading}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>

                      {/* Total & Remove */}
                      <div className="col-md-2 text-end">
                        <div className="fw-bold price-tag primary-text mb-2">
                          ₹{((item.bargainPrice || item.meal.price) * item.quantity).toFixed(0)}
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFromCart(item._id)}
                          disabled={loading}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note: Delivery pooling feature not implemented */}
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="card sticky-top" style={{ top: '100px' }}>
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                {/* Items breakdown */}
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{totalAmount.toFixed(0)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold fs-5 primary-text">
                  <span>Total</span>
                  <span>₹{(totalAmount + deliveryFee).toFixed(0)}</span>
                </div>

                {/* Savings Summary */}
                {cart.items.some(item => item.bargainPrice) && (
                  <div className="mt-3 p-2 bg-success bg-opacity-10 rounded">
                    <small className="text-success fw-bold">
                      <i className="bi bi-currency-dollar me-1"></i>
                      You saved ₹
                      {cart.items.reduce((savings, item) => {
                        if (item.bargainPrice && item.bargainPrice < item.meal.price) {
                          return savings + ((item.meal.price - item.bargainPrice) * item.quantity);
                        }
                        return savings;
                      }, 0).toFixed(0)} through bargaining!
                    </small>
                  </div>
                )}

                {/* Address Section */}
                <div className="mt-4">
                  <h6 className="fw-bold mb-2">Delivery Address</h6>
                  <div className="text-muted small">
                    {user?.address ? (
                      <div>
                        <div>{user.address.street}</div>
                        <div>{user.address.city}, {user.address.pincode}</div>
                      </div>
                    ) : (
                      <div>
                        123 Default Street<br/>
                        Mumbai, 400001
                      </div>
                    )}
                  </div>
                  <button className="btn btn-outline-primary btn-sm mt-2">
                    <i className="bi bi-pencil me-1"></i>
                    Change Address
                  </button>
                </div>

                {/* Error Display */}
                {checkoutError && (
                  <div className="alert alert-danger mt-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {checkoutError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 d-grid gap-2">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleCheckout}
                    disabled={isProcessing || !cart?.items?.length}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-credit-card me-2"></i>
                        Proceed to Checkout
                      </>
                    )}
                  </button>
                  <Link to="/dashboard" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left me-2"></i>
                    Continue Shopping
                  </Link>
                </div>

                {/* Estimated Delivery */}
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    Estimated delivery: 30-45 minutes
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

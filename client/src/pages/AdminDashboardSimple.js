import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mealService, bargainService, orderService, restaurantService, authService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboardSimple = () => {
  const { user, logout } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [stats, setStats] = useState({
    totalMeals: 0,
    totalOrders: 0,
    pendingBargains: 0,
    totalUsers: 0,
    totalRestaurants: 0
  });
  const [bargains, setBargains] = useState([]);
  const [meals, setMeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Form states
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    restaurant: '',
    image: '',
    isVegetarian: false,
    isSurplus: false,
    surplusDiscount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load data with error handling for each API call
      const promises = [
        bargainService.getAllBargains().catch(err => {
          console.warn('Failed to load bargains:', err);
          return { data: [], bargains: [] };
        }),
        mealService.getAllMeals().catch(err => {
          console.warn('Failed to load meals:', err);
          return { data: [], meals: [] };
        }),
        orderService.getAllOrders().catch(err => {
          console.warn('Failed to load orders:', err);
          return { data: [], orders: [] };
        }),
        restaurantService.getAllRestaurants().catch(err => {
          console.warn('Failed to load restaurants:', err);
          return { data: [], restaurants: [] };
        }),
        authService.getAllUsers().catch(err => {
          console.warn('Failed to load users:', err);
          return { data: [], users: [] };
        })
      ];
      
      const [bargainsRes, mealsRes, ordersRes, restaurantsRes, usersRes] = await Promise.all(promises);
      
      // Safely handle data with fallbacks - check both .data and direct properties
      const bargainsData = Array.isArray(bargainsRes.data?.bargains) ? bargainsRes.data.bargains :
                          Array.isArray(bargainsRes.data) ? bargainsRes.data :
                          Array.isArray(bargainsRes.bargains) ? bargainsRes.bargains : [];
      
      const mealsData = Array.isArray(mealsRes.data?.meals) ? mealsRes.data.meals :
                       Array.isArray(mealsRes.data) ? mealsRes.data :
                       Array.isArray(mealsRes.meals) ? mealsRes.meals : [];
      
      const ordersData = Array.isArray(ordersRes.data?.orders) ? ordersRes.data.orders :
                        Array.isArray(ordersRes.data) ? ordersRes.data :
                        Array.isArray(ordersRes.orders) ? ordersRes.orders : [];
      
      const restaurantsData = Array.isArray(restaurantsRes.data?.restaurants) ? restaurantsRes.data.restaurants :
                             Array.isArray(restaurantsRes.data) ? restaurantsRes.data :
                             Array.isArray(restaurantsRes.restaurants) ? restaurantsRes.restaurants : [];
      
      const usersData = Array.isArray(usersRes.data?.users) ? usersRes.data.users :
                       Array.isArray(usersRes.data) ? usersRes.data :
                       Array.isArray(usersRes.users) ? usersRes.users : [];
      
      setBargains(bargainsData);
      setMeals(mealsData);
      setOrders(ordersData);
      setRestaurants(restaurantsData);
      setUsers(usersData);
      
      // Calculate stats safely
      setStats({
        totalMeals: mealsData.length,
        totalOrders: ordersData.length,
        pendingBargains: bargainsData.filter(b => b.status === 'pending').length,
        totalUsers: usersData.length,
        totalRestaurants: restaurantsData.length
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load dashboard data. Some features may not be available.');
      
      // Set empty arrays as fallbacks
      setBargains([]);
      setMeals([]);
      setOrders([]);
      setRestaurants([]);
      setUsers([]);
      setStats({
        totalMeals: 0,
        totalOrders: 0,
        pendingBargains: 0,
        totalUsers: 0,
        totalRestaurants: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Bargain management functions
  const handleBargainResponse = async (bargainId, response, counterPrice = null) => {
    try {
      // Prepare the request body based on response type
      const requestBody = { status: response };
      if (response === 'counter' && counterPrice) {
        requestBody.counterPrice = counterPrice;
        requestBody.status = 'countered'; // Use 'countered' as the status
      }
      
      await bargainService.respondToBargain(bargainId, requestBody);
      
      // Update bargains list
      setBargains(prev => prev.map(b => 
        b._id === bargainId 
          ? { 
              ...b, 
              status: requestBody.status, 
              adminResponse: response, 
              counterPrice: counterPrice || b.counterPrice 
            } 
          : b
      ));
      
      // Update pending bargains count only if it was previously pending
      setBargains(prevBargains => {
        const bargain = prevBargains.find(b => b._id === bargainId);
        if (bargain && bargain.status === 'pending') {
          setStats(prev => ({
            ...prev,
            pendingBargains: Math.max(0, prev.pendingBargains - 1)
          }));
        }
        return prevBargains;
      });
      
      alert(`Bargain ${response === 'counter' ? 'counter-offer sent' : response} successfully!`);
    } catch (error) {
      console.error('Error responding to bargain:', error);
      alert('Failed to respond to bargain: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add meal function
  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      const mealData = {
        ...newMeal,
        price: parseFloat(newMeal.price),
        surplusDiscount: newMeal.isSurplus ? parseFloat(newMeal.surplusDiscount) : 0
      };
      
      const response = await mealService.createMeal(mealData);
      setMeals(prev => [response.data, ...prev]);
      setStats(prev => ({ ...prev, totalMeals: prev.totalMeals + 1 }));
      
      // Reset form
      setNewMeal({
        name: '',
        description: '',
        price: '',
        category: '',
        restaurant: '',
        image: '',
        isVegetarian: false,
        isSurplus: false,
        surplusDiscount: 0
      });
      setShowAddMeal(false);
      alert('Meal added successfully!');
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Failed to add meal: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-dashboard min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-shield-check me-2"></i>
            MealMatch Admin Dashboard
          </span>
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button
                className="btn btn-outline-light dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle me-1"></i>
                {user?.name}
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid p-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="bi bi-house me-1"></i>Overview
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'bargains' ? 'active' : ''}`}
              onClick={() => setActiveTab('bargains')}
            >
              <i className="bi bi-currency-dollar me-1"></i>
              Bargains ({stats.pendingBargains})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'meals' ? 'active' : ''}`}
              onClick={() => setActiveTab('meals')}
            >
              <i className="bi bi-cup-hot me-1"></i>Meals
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="bi bi-bag me-1"></i>Orders
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="bi bi-people me-1"></i>Users
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="row">
            <div className="col-12">
              <div className="alert alert-success" role="alert">
                <h5 className="alert-heading">Welcome to Admin Dashboard!</h5>
                <p>You are successfully logged in as an administrator.</p>
                <p className="mb-0">
                  <strong>User:</strong> {user?.email}<br />
                  <strong>Role:</strong> {user?.role}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="row">
                <div className="col-md-2">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-people"></i> Users
                      </h5>
                      <h3>{stats.totalUsers}</h3>
                      <small>Total registered users</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-2">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-bag"></i> Orders
                      </h5>
                      <h3>{stats.totalOrders}</h3>
                      <small>Total orders</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-2">
                  <div className="card bg-warning text-white">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-currency-dollar"></i> Bargains
                      </h5>
                      <h3>{stats.pendingBargains}</h3>
                      <small>Pending bargains</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-2">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-shop"></i> Restaurants
                      </h5>
                      <h3>{stats.totalRestaurants}</h3>
                      <small>Partner restaurants</small>
                    </div>
                  </div>
                </div>

                <div className="col-md-2">
                  <div className="card bg-dark text-white">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-cup-hot"></i> Meals
                      </h5>
                      <h3>{stats.totalMeals}</h3>
                      <small>Available meals</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4">
                <h5>Quick Actions</h5>
                <div className="btn-group" role="group">
                  <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={() => setActiveTab('meals')}
                  >
                    <i className="bi bi-plus"></i> Manage Meals
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-warning"
                    onClick={() => setActiveTab('bargains')}
                  >
                    <i className="bi bi-check"></i> Approve Bargains ({stats.pendingBargains})
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-info"
                    onClick={() => setActiveTab('orders')}
                  >
                    <i className="bi bi-graph-up"></i> View Orders
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-success"
                    onClick={() => setActiveTab('users')}
                  >
                    <i className="bi bi-people"></i> Manage Users
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bargains Tab */}
        {activeTab === 'bargains' && (
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Bargain Requests</h4>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={loadData}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                </button>
              </div>

              {bargains.length === 0 ? (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  No bargain requests found. When users make bargain offers, they will appear here.
                </div>
              ) : (
                <div className="row">
                  {bargains.map((bargain) => (
                    <div key={bargain._id} className="col-md-6 mb-3">
                      <div className={`card border-${
                        bargain.status === 'pending' ? 'warning' :
                        bargain.status === 'accepted' ? 'success' : 
                        bargain.status === 'countered' ? 'info' : 'danger'
                      }`}>
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">
                            <i className="bi bi-currency-dollar me-1"></i>
                            Bargain Request
                          </h6>
                          <span className={`badge bg-${
                            bargain.status === 'pending' ? 'warning' :
                            bargain.status === 'accepted' ? 'success' : 
                            bargain.status === 'countered' ? 'info' : 'danger'
                          }`}>
                            {bargain.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-8">
                              <p className="mb-1">
                                <strong>Meal:</strong> {bargain.meal?.name || 'Unknown Meal'}
                              </p>
                              <p className="mb-1">
                                <strong>Restaurant:</strong> {bargain.meal?.restaurant?.name || 'Unknown Restaurant'}
                              </p>
                              <p className="mb-1">
                                <strong>Original Price:</strong> ₹{bargain.originalPrice}
                              </p>
                              <p className="mb-1">
                                <strong>Proposed Price:</strong> ₹{bargain.proposedPrice}
                              </p>
                              {bargain.status === 'countered' && bargain.counterPrice && (
                                <p className="mb-1">
                                  <strong>Counter Offer:</strong> <span className="text-info">₹{bargain.counterPrice}</span>
                                </p>
                              )}
                              <p className="mb-1">
                                <strong>User:</strong> {bargain.user?.email || 'Unknown User'}
                              </p>
                              <p className="mb-0">
                                <strong>Date:</strong> {new Date(bargain.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="col-4 text-end">
                              <div className="badge bg-info mb-2">
                                {((bargain.proposedPrice / bargain.originalPrice) * 100).toFixed(0)}% of original
                              </div>
                              <br />
                              <div className="badge bg-secondary">
                                Save ₹{bargain.originalPrice - bargain.proposedPrice}
                              </div>
                            </div>
                          </div>
                          
                          {bargain.status === 'pending' && (
                            <div className="mt-3 d-flex gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleBargainResponse(bargain._id, 'accepted')}
                              >
                                <i className="bi bi-check me-1"></i>Accept
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleBargainResponse(bargain._id, 'rejected')}
                              >
                                <i className="bi bi-x me-1"></i>Reject
                              </button>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => {
                                  const counterPrice = prompt('Enter counter price:');
                                  if (counterPrice && !isNaN(counterPrice)) {
                                    handleBargainResponse(bargain._id, 'counter', parseFloat(counterPrice));
                                  }
                                }}
                              >
                                <i className="bi bi-arrow-left-right me-1"></i>Counter
                              </button>
                            </div>
                          )}
                          
                          {bargain.status === 'countered' && (
                            <div className="mt-3">
                              <div className="alert alert-info mb-2">
                                <i className="bi bi-clock me-1"></i>
                                Waiting for user response to counter offer of ₹{bargain.counterPrice}
                              </div>
                            </div>
                          )}
                          
                          {bargain.status !== 'pending' && bargain.status !== 'countered' && (
                            <div className="mt-3">
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                Responded on {new Date(bargain.updatedAt).toLocaleString()}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meals Tab */}
        {activeTab === 'meals' && (
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Meal Management</h4>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddMeal(true)}
                >
                  <i className="bi bi-plus me-1"></i>Add New Meal
                </button>
              </div>

              {/* Add Meal Modal */}
              {showAddMeal && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Add New Meal</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddMeal}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Meal Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newMeal.name}
                              onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Price (₹)</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newMeal.price}
                              onChange={(e) => setNewMeal({...newMeal, price: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Category</label>
                            <select
                              className="form-control"
                              value={newMeal.category}
                              onChange={(e) => setNewMeal({...newMeal, category: e.target.value})}
                              required
                            >
                              <option value="">Select Category</option>
                              <option value="appetizer">Appetizer</option>
                              <option value="main">Main Course</option>
                              <option value="dessert">Dessert</option>
                              <option value="beverage">Beverage</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Restaurant</label>
                            <select
                              className="form-control"
                              value={newMeal.restaurant}
                              onChange={(e) => setNewMeal({...newMeal, restaurant: e.target.value})}
                              required
                            >
                              <option value="">Select Restaurant</option>
                              {restaurants.map(restaurant => (
                                <option key={restaurant._id} value={restaurant._id}>
                                  {restaurant.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Image URL</label>
                            <input
                              type="url"
                              className="form-control"
                              value={newMeal.image}
                              onChange={(e) => setNewMeal({...newMeal, image: e.target.value})}
                            />
                          </div>
                          <div className="mb-3">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={newMeal.isVegetarian}
                                onChange={(e) => setNewMeal({...newMeal, isVegetarian: e.target.checked})}
                              />
                              <label className="form-check-label">Vegetarian</label>
                            </div>
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={newMeal.isSurplus}
                                onChange={(e) => setNewMeal({...newMeal, isSurplus: e.target.checked})}
                              />
                              <label className="form-check-label">Surplus Item</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={newMeal.description}
                          onChange={(e) => setNewMeal({...newMeal, description: e.target.value})}
                          required
                        ></textarea>
                      </div>
                      {newMeal.isSurplus && (
                        <div className="mb-3">
                          <label className="form-label">Surplus Discount (%)</label>
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            max="50"
                            value={newMeal.surplusDiscount}
                            onChange={(e) => setNewMeal({...newMeal, surplusDiscount: e.target.value})}
                          />
                        </div>
                      )}
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary">
                          <i className="bi bi-check me-1"></i>Add Meal
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowAddMeal(false)}
                        >
                          <i className="bi bi-x me-1"></i>Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Meals List */}
              <div className="row">
                {meals.map((meal) => (
                  <div key={meal._id} className="col-md-4 mb-3">
                    <div className="card">
                      {meal.image && (
                        <img 
                          src={meal.image} 
                          className="card-img-top" 
                          alt={meal.name}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <div className="card-body">
                        <h6 className="card-title">{meal.name}</h6>
                        <p className="card-text small">{meal.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="h6 text-primary">₹{meal.price}</span>
                          <div>
                            {meal.isVegetarian && (
                              <span className="badge bg-success me-1">Veg</span>
                            )}
                            {meal.isSurplus && (
                              <span className="badge bg-warning">Surplus</span>
                            )}
                          </div>
                        </div>
                        <small className="text-muted">
                          {meal.restaurant?.name || 'Unknown Restaurant'}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-3">Order Management</h4>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>User</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id?.slice(-6)}</td>
                        <td>{order.user?.email || 'Unknown'}</td>
                        <td>{order.items?.length || 0} items</td>
                        <td>₹{order.totalAmount}</td>
                        <td>
                          <span className={`badge bg-${
                            order.status === 'delivered' ? 'success' :
                            order.status === 'preparing' ? 'warning' :
                            order.status === 'cancelled' ? 'danger' : 'primary'
                          }`}>
                            {order.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-3">User Management</h4>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Orders</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name || 'Unknown'}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'primary'}`}>
                            {user.role?.toUpperCase() || 'USER'}
                          </span>
                        </td>
                        <td>{user.orders?.length || 0}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardSimple;

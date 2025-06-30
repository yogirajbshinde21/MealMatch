import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!formData.city.trim()) {
      setError('Please select your city for weather-based pricing');
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        city: formData.city
      });
      navigate('/dashboard');
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await login('demo@mealmatch.com', '123456');
      navigate('/dashboard');
    } catch (error) {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <Link to="/" className="text-decoration-none">
                    <h2 className="fw-bold primary-text">MealMatch</h2>
                  </Link>
                  <p className="text-muted">Create your account</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Demo Login Button */}
                <div className="mb-4">
                  <button
                    type="button"
                    className="btn btn-warning w-100 py-2"
                    onClick={handleDemoLogin}
                    disabled={loading}
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    {loading ? 'Logging in...' : 'Try Demo Login Instead'}
                  </button>
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Skip registration and explore with demo account
                    </small>
                  </div>
                </div>

                <div className="text-center mb-3">
                  <span className="text-muted">or</span>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* City Selection for Weather-Based Pricing */}
                  <div className="mb-3">
                    <label htmlFor="city" className="form-label">
                      <i className="bi bi-geo-alt me-1"></i>
                      City <small className="text-muted">(for weather-based pricing)</small>
                    </label>
                    <select
                      className="form-select form-select-lg"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select your city</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Pune">Pune</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Kanpur">Kanpur</option>
                      <option value="Nagpur">Nagpur</option>
                      <option value="Indore">Indore</option>
                      <option value="Thanesar">Thanesar</option>
                      <option value="Bhopal">Bhopal</option>
                      <option value="Visakhapatnam">Visakhapatnam</option>
                      <option value="Pimpri">Pimpri</option>
                      <option value="Patna">Patna</option>
                      <option value="Vadodara">Vadodara</option>
                      <option value="Ghaziabad">Ghaziabad</option>
                    </select>
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      We use your city's weather to offer special discounts!
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create password"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-4">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Create Account
                        </>
                      )}
                    </button>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="terms"
                      required
                    />
                    <label className="form-check-label small text-muted" htmlFor="terms">
                      I agree to the{' '}
                      <a href="#" className="primary-text text-decoration-none">Terms of Service</a>{' '}
                      and{' '}
                      <a href="#" className="primary-text text-decoration-none">Privacy Policy</a>
                    </label>
                  </div>
                </form>

                {/* Footer Links */}
                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="primary-text text-decoration-none fw-semibold">
                      Sign in here
                    </Link>
                  </p>
                </div>

                <div className="text-center mt-3">
                  <Link to="/" className="text-muted text-decoration-none">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>

            {/* Benefits Preview */}
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <h6 className="fw-bold text-center mb-3">Join MealMatch Today</h6>
                <div className="row g-3">
                  <div className="col-md-4 text-center">
                    <i className="bi bi-currency-dollar text-success mb-2" style={{ fontSize: '2rem' }}></i>
                    <h6 className="fw-semibold">Save Money</h6>
                    <p className="small text-muted mb-0">Negotiate prices with our Bargain Bites feature</p>
                  </div>
                  <div className="col-md-4 text-center">
                    <i className="bi bi-cloud-sun text-info mb-2" style={{ fontSize: '2rem' }}></i>
                    <h6 className="fw-semibold">Weather Pricing</h6>
                    <p className="small text-muted mb-0">Get better deals on rainy days and special weather</p>
                  </div>
                  <div className="col-md-4 text-center">
                    <i className="bi bi-star text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                    <h6 className="fw-semibold">Quality Food</h6>
                    <p className="small text-muted mb-0">Discover the best restaurants through reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

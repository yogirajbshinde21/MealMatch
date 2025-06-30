import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
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

    try {
      const userData = await login(formData.email, formData.password);
      // Redirect based on user role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const userData = await login('demo@mealmatch.com', '123456');
      // Demo user is regular user, so redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const userData = await login('admin@mealmatch.com', 'admin123');
      // Admin user redirects to admin dashboard
      navigate('/admin');
    } catch (error) {
      setError('Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <Link to="/" className="text-decoration-none">
                    <h2 className="fw-bold primary-text">MealMatch</h2>
                  </Link>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Demo Login Button */}
                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-warning w-100 py-2 mb-2"
                    onClick={handleDemoLogin}
                    disabled={loading}
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    {loading ? 'Logging in...' : 'Login as Demo User'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger w-100 py-2"
                    onClick={handleAdminLogin}
                    disabled={loading}
                  >
                    <i className="bi bi-shield-check me-2"></i>
                    {loading ? 'Logging in...' : 'Login as Admin'}
                  </button>
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Demo: demo@mealmatch.com / 123456<br />
                      Admin: admin@mealmatch.com / admin123
                    </small>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <span className="text-muted">or</span>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
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

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
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
                          Signing In...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer Links */}
                <div className="text-center">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link to="/signup" className="primary-text text-decoration-none fw-semibold">
                      Sign up here
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

            {/* Features Preview */}
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <h6 className="fw-bold text-center mb-3">Why Login to MealMatch?</h6>
                <div className="row text-center">
                  <div className="col-4">
                    <i className="bi bi-currency-dollar text-success mb-2" style={{ fontSize: '1.5rem' }}></i>
                    <p className="small text-muted mb-0">Bargain Bites</p>
                  </div>
                  <div className="col-4">
                    <i className="bi bi-cloud-sun text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                    <p className="small text-muted mb-0">Weather Pricing</p>
                  </div>
                  <div className="col-4">
                    <i className="bi bi-star text-warning mb-2" style={{ fontSize: '1.5rem' }}></i>
                    <p className="small text-muted mb-0">Reviews & Ratings</p>
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

export default LoginPage;

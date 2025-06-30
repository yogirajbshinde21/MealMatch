import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Hero carousel images
  const heroImages = [
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop&crop=center'
  ];

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Enhanced Intersection Observer for staggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.15, rootMargin: '-50px 0px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');
      
      parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        element.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: 'bi-currency-dollar',
      title: 'Bargain Bites',
      description: 'Negotiate meal prices in real-time! Send custom price offers to restaurants and get instant responses.',
      color: 'success',
      badges: ['Real-time', 'Interactive', 'Save Money'],
      animation: 'fade-up'
    },
    {
      icon: 'bi-cloud-sun',
      title: 'Weather-Based Pricing',
      description: 'Enjoy special discounts on rainy days! Our smart pricing system offers better deals based on weather.',
      color: 'warning',
      badges: ['Smart Pricing', 'Weather Sync', 'Auto Discounts'],
      animation: 'fade-up-delay-1'
    },
    {
      icon: 'bi-star-fill',
      title: 'Quality & Reviews',
      description: 'Rate and review meals after delivery. Help other users discover the best dishes while maintaining quality.',
      color: 'info',
      badges: ['Reviews', 'Quality', 'Community'],
      animation: 'fade-up-delay-2'
    }
  ];

  const steps = [
    { 
      number: 1, 
      title: 'Browse & Search', 
      description: 'Explore restaurants and meals in your area with our smart search', 
      color: 'primary',
      icon: 'bi-search'
    },
    { 
      number: 2, 
      title: 'Bargain or Add', 
      description: 'Make a price offer or add directly to cart', 
      color: 'success',
      icon: 'bi-currency-dollar'
    },
    { 
      number: 3, 
      title: 'Weather Bonus', 
      description: 'Get extra discounts on perfect weather days', 
      color: 'warning',
      icon: 'bi-cloud-sun'
    },
    { 
      number: 4, 
      title: 'Enjoy & Review', 
      description: 'Receive your order and share your experience', 
      color: 'info',
      icon: 'bi-star-fill'
    }
  ];

  return (
    <div className="modern-landing-page">
      {/* Enhanced Hero Section with Parallax Effect */}
      <section className="modern-hero-section position-relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="floating-shapes-container">
          <div className="floating-shape shape-1 parallax-element"></div>
          <div className="floating-shape shape-2 parallax-element"></div>
          <div className="floating-shape shape-3 parallax-element"></div>
          <div className="floating-shape shape-4 parallax-element"></div>
          <div className="floating-shape shape-5 parallax-element"></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="hero-gradient-overlay"></div>
        
        <div className="container-fluid px-4">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6 col-xl-5 offset-xl-1 order-2 order-lg-1">
              <div className="hero-content" data-animate id="hero-text">
                <div className={`hero-text-content ${isVisible['hero-text'] ? 'animate-slide-up' : ''}`}>
                  <div className="hero-badge mb-3">
                    <span className="badge-text">
                      <i className="bi bi-lightning-fill me-2"></i>
                      Revolutionary Food Delivery
                    </span>
                  </div>
                  
                  <h1 className="hero-title mb-4">
                    Welcome to{' '}
                    <span className="brand-gradient-text">MealMatch</span>
                    <div className="title-underline"></div>
                  </h1>
                  
                  <p className="hero-subtitle mb-4">
                    Experience food delivery like never before with our innovative{' '}
                    <span className="highlight-text">Bargain Bites</span> and{' '}
                    <span className="highlight-text">Weather Pricing</span> features.
                  </p>
                  
                  <div className="hero-stats mb-4">
                    <div className="stat-item">
                      <div className="stat-number">100+</div>
                      <div className="stat-label">Restaurant Partners</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">50%</div>
                      <div className="stat-label">Average Savings</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">24/7</div>
                      <div className="stat-label">Service</div>
                    </div>
                  </div>
                  
                  <div className="hero-buttons mb-4">
                    <Link to="/signup" className="btn btn-hero-primary">
                      <span>Get Started</span>
                      <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                    <Link to="/login" className="btn btn-hero-secondary">
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login
                    </Link>
                  </div>

                  {/* Enhanced Demo Section */}
                  <div className="demo-section">
                    <div className="demo-header">
                      <div className="demo-badge">
                        <i className="bi bi-star-fill me-2"></i>Try Demo
                      </div>
                      <span className="demo-description">No signup required</span>
                    </div>
                    <div className="demo-credentials">
                      <div className="credential-item">
                        <span className="label">Email:</span>
                        <code className="credential-code">demo@mealmatch.com</code>
                      </div>
                      <div className="credential-item">
                        <span className="label">Password:</span>
                        <code className="credential-code">123456</code>
                      </div>
                    </div>
                    <Link to="/login" className="demo-btn">
                      <i className="bi bi-lightning-fill me-2"></i>
                      Quick Demo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6 col-xl-5 order-1 order-lg-2">
              <div className="hero-image-container" data-animate id="hero-image">
                <div className={`modern-image-slider ${isVisible['hero-image'] ? 'animate-slide-in' : ''}`}>
                  {heroImages.map((image, index) => (
                    <div
                      key={index}
                      className={`slide ${index === currentImageIndex ? 'active' : ''}`}
                      style={{ backgroundImage: `url(${image})` }}
                    >
                      <div className="image-overlay"></div>
                    </div>
                  ))}
                  
                  {/* Floating Feature Cards */}
                  <div className="floating-feature-cards">
                    <div className="floating-card card-discount">
                      <div className="card-icon">
                        <i className="bi bi-percent"></i>
                      </div>
                      <div className="card-content">
                        <div className="card-title">Save 30%</div>
                        <div className="card-subtitle">With Bargains</div>
                      </div>
                    </div>
                    
                    <div className="floating-card card-weather">
                      <div className="card-icon">
                        <i className="bi bi-cloud-rain"></i>
                      </div>
                      <div className="card-content">
                        <div className="card-title">Weather Bonus</div>
                        <div className="card-subtitle">Extra Discounts</div>
                      </div>
                    </div>
                    
                    <div className="floating-card card-quality">
                      <div className="card-icon">
                        <i className="bi bi-star-fill"></i>
                      </div>
                      <div className="card-content">
                        <div className="card-title">5 Star</div>
                        <div className="card-subtitle">Quality</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image Dots Indicator */}
                  <div className="image-dots">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <div className="scroll-text">Scroll to explore</div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="modern-features-section">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto" data-animate id="features-header">
              <div className={`section-header ${isVisible['features-header'] ? 'animate-fade-up' : ''}`}>
                <div className="section-badge mb-3">
                  <span>Why Choose Us</span>
                </div>
                <h2 className="section-title mb-4">
                  Revolutionary Features That{' '}
                  <span className="text-gradient">Save You Money</span>
                </h2>
                <p className="section-subtitle">
                  We're transforming food delivery with innovative features designed 
                  to give you the best value and experience possible.
                </p>
              </div>
            </div>
          </div>
          
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-lg-4 col-md-6" data-animate id={`feature-${index}`}>
                <div className={`modern-feature-card ${isVisible[`feature-${index}`] ? feature.animation : ''}`}>
                  <div className="feature-card-inner">
                    <div className="feature-icon-container">
                      <div className={`feature-icon bg-${feature.color}`}>
                        <i className={`bi ${feature.icon}`}></i>
                      </div>
                      <div className="icon-ring"></div>
                    </div>
                    
                    <div className="feature-content">
                      <h4 className="feature-title">{feature.title}</h4>
                      <p className="feature-description">{feature.description}</p>
                      
                      <div className="feature-badges">
                        {feature.badges.map((badge, badgeIndex) => (
                          <span key={badgeIndex} className={`feature-badge badge-${feature.color}`}>
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="feature-card-glow"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="modern-steps-section">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto" data-animate id="steps-header">
              <div className={`section-header ${isVisible['steps-header'] ? 'animate-fade-up' : ''}`}>
                <div className="section-badge mb-3">
                  <span>How It Works</span>
                </div>
                <h2 className="section-title mb-4">
                  Get Started in{' '}
                  <span className="text-gradient">4 Simple Steps</span>
                </h2>
                <p className="section-subtitle">
                  Our streamlined process makes it easy to start saving money on your favorite meals.
                </p>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-12">
              <div className="steps-timeline">
                {steps.map((step, index) => (
                  <div key={index} className="step-item" data-animate id={`step-${index}`}>
                    <div className={`step-content ${isVisible[`step-${index}`] ? 'animate-step-in' : ''}`} 
                         style={{ animationDelay: `${index * 0.2}s` }}>
                      
                      <div className="step-number-container">
                        <div className={`step-number bg-${step.color}`}>
                          <span>{step.number}</span>
                        </div>
                        <div className="step-icon">
                          <i className={`bi ${step.icon}`}></i>
                        </div>
                      </div>
                      
                      <div className="step-details">
                        <h5 className="step-title">{step.title}</h5>
                        <p className="step-description">{step.description}</p>
                      </div>
                      
                      {index < steps.length - 1 && (
                        <div className="step-connector">
                          <div className="connector-line"></div>
                          <div className="connector-arrow">
                            <i className="bi bi-arrow-right"></i>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="modern-cta-section position-relative">
        <div className="cta-background-elements">
          <div className="cta-shape cta-shape-1"></div>
          <div className="cta-shape cta-shape-2"></div>
        </div>
        
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto text-center" data-animate id="cta-content">
              <div className={`cta-content ${isVisible['cta-content'] ? 'animate-zoom-in' : ''}`}>
                <div className="cta-badge mb-4">
                  <i className="bi bi-rocket-takeoff me-2"></i>
                  Join the Revolution
                </div>
                
                <h2 className="cta-title mb-4">
                  Ready to Start{' '}
                  <span className="cta-text-highlight">Saving Money?</span>
                </h2>
                
                <p className="cta-subtitle mb-5">
                  Join our growing community and discover amazing food with 
                  MealMatch's innovative bargain bidding and weather-based pricing features. 
                  Experience the future of food ordering today.
                </p>
                
                <div className="cta-buttons">
                  <Link to="/signup" className="btn btn-cta-primary">
                    <i className="bi bi-person-plus me-2"></i>
                    Get Started Now
                  </Link>
                  <Link to="/login" className="btn btn-cta-secondary">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    I Have An Account
                  </Link>
                </div>
                
                <div className="cta-features mt-5">
                  <div className="cta-feature">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Free to join</span>
                  </div>
                  <div className="cta-feature">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Instant savings</span>
                  </div>
                  <div className="cta-feature">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>No hidden fees</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="modern-footer">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="footer-brand">
                <h5 className="brand-name">
                  <span className="brand-gradient-text">MealMatch</span>
                </h5>
                <p className="footer-description">
                  Revolutionizing food delivery with bargain bites and smart weather-based pricing.
                </p>
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="footer-links">
                <Link to="/about" className="footer-link">About</Link>
                <Link to="/contact" className="footer-link">Contact</Link>
                <Link to="/privacy" className="footer-link">Privacy</Link>
                <Link to="/terms" className="footer-link">Terms</Link>
              </div>
              <p className="footer-copyright">
                © 2025 MealMatch. Built for innovation and savings.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import React, { useState } from 'react';
import { Link } from 'react-router';
import './SignForm.css'

const SignupForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'error') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'Account created successfully!', 'success');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: ''
        });
      } else {
        showToast(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="main-container">
        {/* Left side - Form */}
        <div className="left-side">
          <div className="form-box">
            <div className="title">
              <h1>Chat Hub</h1>
            </div>
            
            <div className="welcome-text">
              <h2>Create your account</h2>
            </div>

            <div className="signup-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="input-field"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input-field"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="input-field"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="input-field"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="button" className="signup-button" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    Creating Account...
                    <div className="loading-spinner"></div>
                  </>
                ) : (
                  <>
                    Create Account
                    <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </>
                )}
              </button>
            </div>

            <div className="login-link">
              <p>Already have an account? <Link to="/login" className="link-text">Sign in</Link></p>
            </div>
          </div>
        </div>

        {/* Right side - Background */}
        <div className="right-side">
          <div className="background-overlay">
            <div className="right-content">
              <h3>Welcome to the future</h3>
              <p>Experience innovation like never before. Join our community and unlock endless possibilities.</p>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">✨</div>
                  <span>Premium Features</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🚀</div>
                  <span>Fast & Secure</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🌟</div>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <div className="notification-area">
        {toasts.map((toast) => (
          <div key={toast.id} className={`notification ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignupForm;
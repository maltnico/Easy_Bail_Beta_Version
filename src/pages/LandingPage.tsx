import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/login?mode=signup');
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header 
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      <Hero 
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      <Features />
      <Pricing 
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      <CTA 
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      <Footer />
    </div>
  );
};

export default LandingPage;

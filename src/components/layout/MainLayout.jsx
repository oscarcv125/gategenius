import { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';

/**
 * Main Layout Component
 */
export default function MainLayout({ children }) {
  const [activeTab, setActiveTab] = useState('expiry');

  // Listen for navigation events from other components
  useEffect(() => {
    const handleNavigateToSmartAssignment = (event) => {
      setActiveTab('integration');
      // Optionally scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('navigateToSmartAssignment', handleNavigateToSmartAssignment);

    return () => {
      window.removeEventListener('navigateToSmartAssignment', handleNavigateToSmartAssignment);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pass activeTab to children via React.cloneElement */}
        {typeof children === 'function' ? children(activeTab) : children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>GateGenius v1.0 - HackMTY 2025</p>
            <p className="text-xs mt-1">
              AI-Powered Airline Catering Intelligence Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

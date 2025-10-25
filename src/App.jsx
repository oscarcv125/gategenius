import MainLayout from './components/layout/MainLayout';
import ExpiryDashboard from './modules/expiry/ExpiryDashboard';
import ConsumptionDashboard from './modules/consumption/ConsumptionDashboard';
import ProductivityDashboard from './modules/productivity/ProductivityDashboard';
import SmartAssignmentDashboard from './modules/integration/SmartAssignmentDashboard';

/**
 * GateGenius - AI-Powered Airline Catering Intelligence Platform
 * HackMTY 2025
 *
 * Team:
 * - Abel: Data services, API integration, Zustand stores, algorithms
 * - Hermann: Module 1 (Expiration Intelligence)
 * - Diego: Module 2 (Consumption Prediction)
 * - Oscar: Module 3 (Productivity) + Integration + Layout
 */
function App() {
  return (
    <MainLayout>
      {(activeTab) => {
        switch (activeTab) {
          case 'expiry':
            return <ExpiryDashboard />;
          case 'consumption':
            return <ConsumptionDashboard />;
          case 'productivity':
            return <ProductivityDashboard />;
          case 'integration':
            return <SmartAssignmentDashboard />;
          default:
            return <ExpiryDashboard />;
        }
      }}
    </MainLayout>
  );
}

export default App;

import MainLayout from './components/layout/MainLayout';
import ExpiryDashboard from './modules/expiry/ExpiryDashboard';
import ConsumptionDashboard from './modules/consumption/ConsumptionDashboard';
import ProductivityDashboard from './modules/productivity/ProductivityDashboard';
import SmartAssignmentDashboard from './modules/integration/SmartAssignmentDashboard';

/**
 * GateGenius - AI-Powered Airline Catering Intelligence Platform
 * HackMTY 2025
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

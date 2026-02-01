import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import Overview from './pages/Overview';
import SavedCampaigns from './pages/SavedCampaigns';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Overview />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:customerId" element={<CustomerDetails />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="campaigns/:campaignId" element={<CampaignDetails />} />
              <Route path="generator" element={<Home />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

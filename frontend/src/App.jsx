import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SavedCampaigns from './pages/SavedCampaigns';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="saved" element={<SavedCampaigns />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

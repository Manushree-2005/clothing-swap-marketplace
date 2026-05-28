import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Listings from './pages/Listings';
import ItemDetail from './pages/ItemDetail';
import SwapRequest from './pages/SwapRequest';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Community from './pages/Community';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Listings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/swap/:id" element={<SwapRequest />} />
        <Route path="/chat/:swapId" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
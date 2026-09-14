import { Routes, Route } from 'react-router-dom';
import OgrenciFormu from './OgrenciFormu';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

function App() {
  return (
    <Routes>
      <Route path="/" element={<OgrenciFormu />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/panel" element={<AdminPanel />} />
    </Routes>
  );
}

export default App;
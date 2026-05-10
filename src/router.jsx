import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Report from './pages/Report.jsx';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/report/:matchId" element={<Report />} />
    </Routes>
  );
}

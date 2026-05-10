import { Routes, Route, useParams } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Report from './pages/Report.jsx';

function ReportWrapper() {
  const { matchId } = useParams();
  return <Report key={matchId} />;
}

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/report/:matchId" element={<ReportWrapper />} />
    </Routes>
  );
}

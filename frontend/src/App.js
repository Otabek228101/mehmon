import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import ReceiptHistoryPage from './ReceiptHistoryPage';
import ReceiptPage from './ReceiptPage';
import AddReferencePage from './AddReferencePage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<ReceiptHistoryPage />} />
        <Route path="/receipt/:id" element={<ReceiptPage />} />
        <Route path="/admin" element={<AddReferencePage />} />
      </Routes>
    </Router>
  );
}

export default App;

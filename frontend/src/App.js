import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import ReceiptPage from "./ReceiptPage";
import ReceiptHistoryPage from './ReceiptHistoryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<ReceiptHistoryPage />} />
        <Route path="/receipt/:id" element={<ReceiptPage />} />
        <Route path="/receipt" element={<ReceiptPage />} />
      </Routes>
    </Router>
  );
}

export default App;
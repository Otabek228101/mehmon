<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Receipt from "./pages/Receipt";
import History from "./pages/History";
import References from "./pages/References";

=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import ReceiptHistoryPage from './ReceiptHistoryPage';
import ReceiptPage from './ReceiptPage';
import AddReferencePage from './AddReferencePage';
>>>>>>> fee31353a8679e5cc77c143b184aed77ca27830c
function App() {
  return (
    <Router>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/receipt/:id" element={<Receipt />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/references" element={<References />} />
=======
        <Route path="/" element={<HomePage />} />
        <Route path="/history" element={<ReceiptHistoryPage />} />
        <Route path="/receipt/:id" element={<ReceiptPage />} />
        <Route path="/admin" element={<AddReferencePage />} />
>>>>>>> fee31353a8679e5cc77c143b184aed77ca27830c
      </Routes>
    </Router>
  );
}

export default App;

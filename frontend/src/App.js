import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Receipt from "./pages/Receipt";
import History from "./pages/History";
import References from "./pages/References";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/receipt/:id" element={<Receipt />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/references" element={<References />} />
      </Routes>
    </Router>
  );
}

export default App;
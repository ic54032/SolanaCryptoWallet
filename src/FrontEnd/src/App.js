import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./HomePage/Home";
import CryptoWalletAuth from "./Auth/CryptoWalletAuth";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CryptoWalletAuth />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

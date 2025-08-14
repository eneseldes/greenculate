import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import TotalEmissions from "./pages/TotalEmissionsPage/TotalEmissionsPage";
import "./App.scss";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ToplamEmisyon" element={<TotalEmissions />} />
      </Routes>
    </Router>
  );
}

export default App;
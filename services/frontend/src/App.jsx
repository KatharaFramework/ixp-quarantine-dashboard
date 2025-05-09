import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import QuarantineDashboard from "./pages/QuarantineDashboard.jsx";
import QuarantineNavbar from "./components/Navbar.jsx";


function App() {
    return (
        <Router>
            <QuarantineNavbar />
            <div className="container mt-4">
                <Routes>
                    <Route path="/" element={<QuarantineDashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

import React from 'react';
import './Home.css';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
const HomePage = () => {
    return (
        <div className="home-page">
            <div className="nav-bar">
                <Link to="/"><h2 className="logo">PAG🧂</h2></Link>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/">Assets</Link>
                    <Link to="/">Buy</Link>
                    <Link to="/">Send</Link>
                </div>
             </div>
            <div className="main-content">Something</div>
        </div>

    );
};

export default HomePage;
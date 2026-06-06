import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Page Imports
import { HomePage } from './pages/HomePage';
import { Gallery } from './pages/Gallery';
import { WebRendererApp } from './WebRenderApp';

// We can define a simple layout or just the routes
function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    {/* Main Landing Page */}
                    <Route path="/" element={<HomePage />} />

                    {/* The Video Editor / Renderer */}
                    <Route path="/editor" element={<WebRendererApp />} />

                    {/* Template Gallery */}
                    <Route path="/gallery" element={<Gallery />} />

                    {/* Redirect any unknown routes back to Home */}
                    <Route path="*" element={<HomePage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

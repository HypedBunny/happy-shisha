import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Loader from './components/Loader';
import Layout from './components/Layout';
import Home from './pages/Home';
import Info from './pages/Info';
import BookNow from './pages/BookNow';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (adjust as needed)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300); // reduced from 2500ms for better UX

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Loader key="loader" />}
      </AnimatePresence>

      {!loading && (
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="info" element={<Info />} />
              <Route path="book" element={<BookNow />} />
            </Route>
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;

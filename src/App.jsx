import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './assets/components/ScrollToTop';
import Navbar from './assets/components/Navbar';
import Footer from './assets/components/Footer';
import LandingPage from './assets/pages/LandingPage';
import About from './assets/pages/About';
import SignIn from './assets/pages/SignIn';
import SignUp from './assets/pages/SignUp';
import Products from './assets/pages/Products';
import ProductAdminPage from './assets/pages/ProductAdmin';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Routes with Navbar and Footer */}
        <Route 
          path="/" 
          element={
            <>
              <Navbar />
              <LandingPage />
              <Footer />
            </>
          } 
        />
        <Route 
          path="/about" 
          element={
            <>
              <Navbar />
              <About />
              <Footer />
            </>
          } 
        />
        <Route 
          path="/products" 
          element={
            <>
              <Navbar />
              <Products />
              <Footer />
            </>
          } 
        />

        {/* Routes without Navbar and Footer */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Admin routes - only NavbarAdmin, no Footer or regular Navbar */}
        <Route path="/admin/products" element={<ProductAdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

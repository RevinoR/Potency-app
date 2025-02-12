import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from './assets/components/ScrollToTop';
import Navbar from './assets/components/Navbar'
import Footer from './assets/components/Footer'
import LandingPage from './assets/pages/LandingPage'
import About from './assets/pages/About'
import SignIn from './assets/pages/SignIn'
import SignUp from './assets/pages/SignUp'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Routes with Navbar and Footer */}
        <Route element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Routes without Navbar and Footer */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

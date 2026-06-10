import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import MapPage from './pages/MapPage'
import BookFinderPage from './pages/BookFinderPage'
import AddaPage from './pages/AddaPage'
import StoriesPage from './pages/StoriesPage'
import WishlistPage from './pages/WishlistPage'

function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/finder" element={<BookFinderPage />} />
          <Route path="/adda" element={<AddaPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

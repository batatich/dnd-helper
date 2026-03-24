import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/navigation';
import { Home } from './pages/home.tsx';
import { Footer } from './components/Footer';
import { CharacterSheet } from './pages/CharacterSheet';
import { WorldBuilder } from './pages/WorldBuilder';
import { Notes } from './pages/Notes';
import { About } from './pages/about.tsx';
import { Authors } from './pages/authors.tsx';
import { Support } from './pages/Support.tsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/character" element={<CharacterSheet />} />
            <Route path="/world" element={<WorldBuilder />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/about" element={<About />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
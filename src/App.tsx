import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/navigation';
import { Home } from './pages/Home.tsx';
import { Footer } from './components/Footer';
import { CharacterSheet } from './pages/CharacterSheet';
import { WorldBuilder } from './pages/WorldBuilder';
import { Notes } from './pages/Notes';
import { About } from './pages/About.tsx';
import { Authors } from './pages/Authors.tsx';
import { Support } from './pages/Support.tsx';
import { CharactersList } from './pages/CharactersList.tsx';
import { CreateItem } from './pages/CreateItem'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 to-blue-900 text-white">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/character/:id" element={<CharacterSheet />} />
            <Route path="/world" element={<WorldBuilder />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/about" element={<About />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/support" element={<Support />} />
            <Route path="/characters" element={<CharactersList />} />
            <Route path="/items/create" element={<CreateItem />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// NOUVELLES PAGES créées
import { HomePage } from './pages/client/HomePage'
import { CataloguePage } from './pages/client/CataloguePage'
import { DashboardPartenaire } from './pages/partenaire/DashboardPartenaire'
import { DashboardAdmin } from './pages/admin/DashboardAdmin'

// Layout
import { Navbar } from './components/client/Navbar'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <Navbar />

        {/* Contenu principal */}
        <main className="flex-1">
          <Routes>
            {/* Routes CLIENT - Publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogue" element={<CataloguePage />} />

            {/* Routes PARTENAIRE - Protégées */}
            <Route path="/partenaire" element={<DashboardPartenaire />} />

            {/* Routes ADMIN - Protégées */}
            <Route path="/admin" element={<DashboardAdmin />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 bg-muted/50">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2025 Joris Streaming. Tous droits réservés.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App

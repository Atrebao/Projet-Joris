
import { BrowserRouter  as Router, Route, Routes} from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Footer from './components/footer'
import AbonnementDetails from './pages/AbonnementDetails'
function App() {


  return (
    <>
      <Router>
        <Navbar/> 
        <Routes>
          <Route path='/'  element={<Home/>}/>
          <Route path='/abonnement/:id'  element={<AbonnementDetails/>}/>
        </Routes>
        <Footer/>
      </Router>
    </>
  )
}

export default App

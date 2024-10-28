
import { BrowserRouter  as Router, Route, Routes} from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Footer from './components/footer'
import Conditions from './pages/Conditions'
import AbonnementDetails from './pages/AbonnementDetails'
import Abonnement from './pages/Abonnement'
function App() {


  return (
    <>
      <Router>
        <Navbar/> 
        <Routes>
          <Route path='/'  element={<Home/>}/>
          {/* <Route path='/abonnement/:id'  element={<AbonnementDetails/>}/> */}
          <Route path='/abonnement/:id'  element={<Abonnement/>}/>
          <Route path='/conditions' element ={<Conditions/>}/>
        </Routes>
        <Footer/>
      </Router>
    </>
  )
}

export default App

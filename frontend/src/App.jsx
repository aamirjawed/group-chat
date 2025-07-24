
import './App.css'
import SignupForm from './components/SignupForm'
import { BrowserRouter as Router, Routes, Route } from 'react-router';


function App() {


  return (
   <Router>
      <Routes>
        <Route path="/" element={<SignupForm />} />
        
      </Routes>
    </Router>
  )
}

export default App

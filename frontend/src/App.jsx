
import './App.css'
import SignupForm from './components/signup/SignupForm'
import LoginPage from './components/login/login';
import { BrowserRouter as Router, Routes, Route } from 'react-router';


function App() {


  return (
   <Router>
      <Routes>
        <Route path="/" element={<SignupForm />} />
        <Route path="/login" element={<LoginPage />} />
        
      </Routes>
    </Router>
  )
}

export default App

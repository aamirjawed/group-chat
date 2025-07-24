
import './App.css'
import SignupForm from './components/signup/SignupForm'
import LoginPage from './components/login/login';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Dashboard from './components/dashboard/Dashboard';


function App() {


  return (
   <Router>
      <Routes>
        <Route path="/" element={<SignupForm />} />
        <Route path="/login" element={<LoginPage />} />  
        <Route path="/dashboard" element={<Dashboard />} />  
      </Routes>
    </Router>
  )
}

export default App

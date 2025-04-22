import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Signup from './pages/Signup';
import Login from './pages/Login'; 
import Start from './pages/start';

function App() {
  return (
    <Router>
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<Start />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
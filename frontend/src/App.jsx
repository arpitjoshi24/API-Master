import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
  
import Start from './pages/start';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
    
        <Route path="/start" element={<Start />} />
       <Route path='/' element={<Home/>}/>
      </Routes>
    </Router>
  );
}

export default App;

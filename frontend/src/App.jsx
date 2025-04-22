import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
  
import Start from './pages/start';

function App() {
  return (
    <Router>
      <Routes>
    
        <Route path="/" element={<Start />} />
       
      </Routes>
    </Router>
  );
}

export default App;

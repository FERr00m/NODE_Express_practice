import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './img/logo.svg';
import './App.css';
import Vacations from './Vacations';

function Home() {
  return <i>Coming soon</i>;
}
function About() {
  return <i>Coming soon About</i>;
}

function NotFound() {
  return (
    <div className="container">
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
function App() {
  return (
    <Router>
      <header>
        <div className="container">
          <nav>
            <ul>
              <li>
                <img src={logo} width="50" height="50" alt="" />
              </li>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/vacations">Vacations</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/about" exact element={<About />} />
        <Route path="/vacations" exact element={<Vacations />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

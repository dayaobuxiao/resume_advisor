import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ResumeForm from './components/ResumeForm';
import SubscriptionForm from './components/SubscriptionForm';
import AnalysisResult from './components/AnalysisResult';

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/resume">Submit Resume</Link>
            </li>
            <li>
              <Link to="/subscription">Subscription</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/login">
            <LoginForm />
          </Route>
          <Route path="/register">
            <RegisterForm />
          </Route>
          <Route path="/resume">
            <ResumeForm />
          </Route>
          <Route path="/subscription">
            <SubscriptionForm />
          </Route>
          <Route path="/analysis/:resumeId">
            <AnalysisResult />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;

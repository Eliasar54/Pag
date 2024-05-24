import React, { useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';

function App() {
  const [code, setCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { code });
      if (response.status === 200) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      alert('Invalid or already used code');
    }
  };

  return (
    <div className="container">
      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter login code"
            className="login-input"
          />
          <button type="submit" className="login-button">Login</button>
        </form>
      ) : (
        <Dashboard code={code} />
      )}
    </div>
  );
}

export default App;

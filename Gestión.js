// frontend/src/App.js
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
    <div>
      {!isAuthenticated ? (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter login code"
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <Dashboard code={code} />
      )}
    </div>
  );
}

export default App;

// frontend/src/Dashboard.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

function Dashboard({ code }) {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io({ query: { code } });
    setSocket(newSocket);

    newSocket.on('output', (data) => {
      setOutput(data);
    });

    return () => newSocket.disconnect();
  }, [code]);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('command', command);
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command"
        />
        <button type="submit">Execute</button>
      </form>
      <pre>{output}</pre>
    </div>
  );
}

export default Dashboard;

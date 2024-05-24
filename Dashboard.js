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
    <div className="dashboard">
      <h2>Dashboard</h2>
      <form onSubmit={handleSubmit} className="command-form">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command"
          className="command-input"
        />
        <button type="submit" className="command-button">Execute</button>
      </form>
      <pre className="output">{output}</pre>
    </div>
  );
}

export default Dashboard;

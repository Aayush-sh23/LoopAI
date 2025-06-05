// frontend/src/App.js

import React from 'react';
import IngestionForm from './components/IngestionForm';
import StatusViewer from './components/StatusViewer';
import './App.css'; // Import your CSS file for styling

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Data Ingestion API System</h1>
      </header>
      <main className="App-main">
        <IngestionForm />
        <hr className="divider" /> {/* Horizontal line to separate sections */}
        <StatusViewer />
      </main>
      <footer className="App-footer">
        <p>&copy; 2025 Data Ingestion System</p>
      </footer>
    </div>
  );
}

export default App;
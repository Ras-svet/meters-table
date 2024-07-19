import React from 'react';
import Table from '../Table/Table';
import { Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="body">
      <div className="page">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <header className="header">Список счетчиков</header>
                <main className="content">
                  <Table />
                </main>
              </>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;

import { useState, FormEvent, ChangeEvent } from 'react';
import { MemoryRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './output.css';
import './App.css';
import ChatView from './components/ChatExplorer/ChatView';
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import FileExplorer from './components/FileExplorer/FileExplorer';
import EntryPage from './components/EntryPage';
import MainPage from './components/MainPage';
import Terminal from './components/Terminal/Terminal';
import path from 'path'
import { FileNode } from "../main_renderer/interfaces";

function AppContent() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <button
        className="back-to-entry-button"
        onClick={() => navigate('/')}
        title="Back to entry page"
      >
        <img src={icon} alt="Semantic OS" />
      </button>
      <div className="routes-container">
        <Routes>
          <Route path="/" element={<EntryPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/terminal" element={<Terminal />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

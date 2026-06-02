import { useState, FormEvent, ChangeEvent } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ChatView from './components/ChatView';

function CNet() {

  return (
    <div>
      <ChatView/>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CNet />} />
      </Routes>
    </Router>
  );
}

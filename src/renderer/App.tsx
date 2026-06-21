import { useState, FormEvent, ChangeEvent } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ChatView from './components/ChatExplorer/ChatView';
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import FileExplorer from './components/FileExplorer/FileExplorer';
import EntryPage from './components/EntryPage';
import MainPage from './components/MainPage';
import path from 'path'
import { FileNode } from "../main_renderer/interfaces";

function CNet() {
  const rootNode:FileNode ={
    name: "semantic-os-desktop-v2",
    isFolder: true,
    fullPath: "C:\\Users\\Ato_K\\Documents\\programming\\semantic-os-desktop-v2"
  } 
  return (
    <div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

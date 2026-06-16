import { useState, FormEvent, ChangeEvent } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import ChatView from './components/ChatView';
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import FileExplorer from './components/FileExplorer';
import path from 'path'
import { FileNode } from './components/sampleData';

function CNet() {
  const rootNode:FileNode ={
    name: "semantic-os-desktop-v2",
    isFolder: true,
    fullPath: "C:\\Users\\Ato_K\\Documents\\programming\\semantic-os-desktop-v2"
  } 
  return (
    <div>
      {/* <ChatView/> */}
      <FileExplorer rootNode={rootNode}/>
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

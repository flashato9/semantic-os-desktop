import './ChatView.css';
import { TreeInstance } from "@headless-tree/core";
import { FileNode } from './sampleData';
import File from "./File"
import "./RootDirectory.css"

interface RootDirectoryProps{
  tree:TreeInstance<FileNode>;
}

function CNet({tree}: RootDirectoryProps) {
  
  return (
    <ul {...tree.getContainerProps} className="tree-container" >
      {tree.getItems().map((item) => (
        <li className='tree-item'>
          <File metadata = {item}/>
        </li>
      ))
      }
    </ul>
  );
}

export default function RootDirectory({tree}: RootDirectoryProps) {
  return <CNet tree = {tree}/>;
}

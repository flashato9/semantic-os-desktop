import './DirectoryView.css';
import { ItemInstance, TreeInstance } from "@headless-tree/core";
import { FileNode } from "../../../main_renderer/interfaces";
import File from "./File"

interface RootDirectoryProps{
  tree:TreeInstance<FileNode>
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

export default function DirectoryView({tree}: RootDirectoryProps) {
  return <CNet tree = {tree}/>;
}

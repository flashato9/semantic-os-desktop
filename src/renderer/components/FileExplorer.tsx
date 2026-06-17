import { useState, useEffect, useRef } from 'react';
import './ChatView.css';
import { asyncDataLoaderFeature, hotkeysCoreFeature, selectionFeature, syncDataLoaderFeature, TreeInstance } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";
import { FileNode } from './sampleData';
import { MethodName } from '../../main_renderer/enums';
import RootDirectory from './RootDirectory';
import "./FileExplorer.css"

interface FileExplorerState {
  directoryItems: FileNode[],
}
interface FileExplorerProps{
  rootNode:FileNode;
}
async function getFileNode(itemId:string):Promise<FileNode> {
  const result: FileNode = await window.electron?.ipcRenderer.invoke(
      MethodName.getFileNode,
      itemId,
    );
    return result;
}
async function getFileNodeChildren(itemId:string):Promise<FileNode[]> {
  const result: FileNode[] = await window.electron?.ipcRenderer.invoke(
      MethodName.getFileNodeChildren,
      itemId,
    );
    return result;
}


function CNet({rootNode}: FileExplorerProps) {
  const [fileExplorerState,setFileExplorerState] = useState<FileExplorerState>({
    directoryItems: []
  })
  const [directoryTree, setDirectoryTree] = useState<TreeInstance<FileNode>>(
    useTree<FileNode>({
      rootItemId: rootNode.fullPath,
      getItemName: (item) => item.getItemData().name,
      isItemFolder: (item) => Boolean(item.getItemData().isFolder),
      createLoadingItemData: () => {
        return {
          name:"loading...",
          isFolder: false,
          fullPath: "loading..."
        }
      },
      dataLoader: {
        getItem: async (itemId) => await getFileNode(itemId),
        getChildren: async (itemId) => (await getFileNodeChildren(itemId)).map(elem => elem.fullPath),
      },
      indent: 20,
      features: [asyncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
    })
  )
  const tree = directoryTree;
  return (
    <div className='file-explorer'>
        <RootDirectory tree={tree}/>
    </div>
        
    
  );
}

export default function FileExplorer({rootNode}: FileExplorerProps) {
  return <CNet rootNode={ rootNode}/>;
}

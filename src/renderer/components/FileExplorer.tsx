import { useState, useEffect, useRef } from 'react';
import './ChatView.css';
import { asyncDataLoaderFeature, hotkeysCoreFeature, ItemInstance, selectionFeature, syncDataLoaderFeature, TreeInstance } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";
import { FileNode } from './sampleData';
import { MethodName } from '../../main_renderer/enums';
import DirectoryView from './DirectoryView';
import "./FileExplorer.css"
import { FileView } from './FileView';

interface FileExplorerState {
  directoryItems: FileNode[]
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const directoryTree = useTree<FileNode>({
      rootItemId: rootNode.fullPath,
      state:{
        selectedItems
      },
      setSelectedItems:setSelectedItems,
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
  function isFileSelected(selectedItems:string[]):boolean {
    if (selectedItems.length == 0){
      return false;
    }
    if (selectedItems.length > 1 ){
      return false;
    }
    const selectedItem = directoryTree.getItemInstance(selectedItems[0]).getItemData() ;
    if (selectedItem.isFolder){
      return false;
    }
    return true;
  }
  function getSelectedItem(selectedItems:string[]):ItemInstance<FileNode>{
    const selectedItem = directoryTree.getItemInstance(selectedItems[0]);
    return selectedItem;
  }
  
  const tree = directoryTree;
  return (
  <div className="workspace-split-container">
    
    {/* 1. Left Hand Side: Navigation Tree Panel */}
    <div className="directory-panel-wrapper">
      <DirectoryView tree={tree} />
    </div>

    {/* 2. Right Hand Side: Code Content Viewer Panel */}
    {isFileSelected(selectedItems) && (
      <div className="file-viewer-wrapper">
        <FileView fileMetadata={getSelectedItem(selectedItems)} />
      </div>
    )}

  </div>
  );
}

export default function FileExplorer({rootNode}: FileExplorerProps) {
  return <CNet rootNode={ rootNode}/>;
}

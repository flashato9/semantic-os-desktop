import './FileView.css';
import { FileNode } from "../../../main_renderer/interfaces";
import { ItemInstance } from '@headless-tree/core';
import { MethodName } from '../../../main_renderer/enums';
import { useEffect, useState } from 'react';

interface FileViewProps {
    fileMetadata:ItemInstance<FileNode>
}
interface FileViewState{
    fileContent:string
}



export function FileView({ fileMetadata  }: FileViewProps) {

  const [fileViewState,setFileViewState] = useState<FileViewState>({
    fileContent:''
  })

    async function getFileContent(filePath:string){
        const fileContent =  await window.electron?.ipcRenderer.invoke(
                MethodName.getFileContent,
                filePath,
            );
        setFileViewState({
            fileContent: fileContent
        })
    }

  useEffect(() =>{
    getFileContent(fileMetadata.getItemData().fullPath )
  },[fileMetadata])

  return (
    <div className="file-viewer-container">
  {/* Add an optional subtle top header bar for the file editor frame */}
    <div className="editor-header">
        <span>{fileMetadata.getItemName() || "Text Editor"}</span>
    </div>
    
    <div className="editor-body">
        <pre className="editor-content">
        <code>{fileViewState.fileContent}</code>
        </pre>
    </div>
    </div>
  );
}
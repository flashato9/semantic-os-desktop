import './File.css';
import {ItemInstance} from "@headless-tree/core";
import { FileNode } from "../../../main_renderer/interfaces";
import cn from "classnames";

interface FileProps{
  metadata:ItemInstance<FileNode>
}

function CNet({metadata}: FileProps) {
  const level = metadata.getItemMeta().level;
  return (
    <button
      {...metadata.getProps()}
      key={metadata.getId()}
      className={cn("tree-row", {
        focused: metadata.isFocused(),
        selected: metadata.isSelected(),
        "is-folder": metadata.isFolder(),
      })}
    >
      {/* 1. Indentation Spacer Element */}
      <div 
        style={{ width: `${level * 20}px` }} 
        className="shrink-0" 
      />

      {/* 2. Visual Folder/File Indicators */}
      <div className="tree-icon-frame">
        {metadata.isFolder() ? (metadata.isExpanded() ? "📂" : "📁") : "📄"}
      </div>

      {/* 3. Text String Content Display */}
      <span className="tree-text">
        {metadata.getItemName()}
      </span>
    </button>
  );
}

export default function RootDireFilePropsctory({metadata}: FileProps) {
  return <CNet metadata = {metadata}/>;
}

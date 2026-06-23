import { MessageData } from "../../main_renderer/classes";
import { MethodName } from "../../main_renderer/enums";

//Graph
export async function isGraphProcessRunning(): Promise<Boolean> {
    console.log("checking if graph process is running.");
    const result: Boolean = await window.electron?.ipcRenderer.invoke(MethodName.isLangGraphProcessRunning, []);
    return result;
}
export async function initiateGraphProcess() {
    console.log("initiating graph process");
    await window.electron?.ipcRenderer.invoke(MethodName.initializeGraphProcess, []);
    return;
}
export async function terminateGraphProcess() {
    console.log("terminating graph process");
    await window.electron?.ipcRenderer.invoke(MethodName.terminateGraphProcess, []);
    return;
}
export async function getChatHistory(
  assistantId: string,
  threadId: string): Promise<MessageData[]> {
  console.log('getting chat history.');

  const result: MessageData[] = await window.electron?.ipcRenderer.invoke(
    MethodName.getChatHistory,
    { assistantId: assistantId, threadId: threadId }
  );
  return result;
}


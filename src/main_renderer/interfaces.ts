export interface MessageData {
  id: string;
  sender: 'user' | 'system';
  text: string;
}
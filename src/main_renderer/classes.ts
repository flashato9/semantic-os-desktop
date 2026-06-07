import { v4 as uuidv4 } from 'uuid';
export class MessageData {
  sender: string;
  message: string;
  id: string;

  constructor(sender: string, message: string, id?: string) {
    this.sender = sender;
    this.message = message;
    this.id = id || uuidv4();
  }
  toJSON(): any {
    return {
      sender: this.sender,
      message: this.message,
      id: this.id,
    };
  }
  toString() {
    return JSON.stringify(this.toJSON());
  }
}

export class SystemMessageData extends MessageData {
  user_message_id: string;

  constructor(message: string, user_message_id: string,id?:string) {
    super('system', message,id);
    this.user_message_id = user_message_id;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      user_message_id: this.user_message_id,
    };
  }
  override toString() {
    return JSON.stringify(this.toJSON());
  }
}

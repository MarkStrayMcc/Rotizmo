import { MessageType } from "@app/enums/MessageType";

export class Message {
    
    constructor(public text: string = null,
        public type: MessageType = MessageType.Info,
        public messageList: string[] = null) { }

}

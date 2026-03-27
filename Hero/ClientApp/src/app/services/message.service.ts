import { Injectable } from "@angular/core";
import { MessageCategory } from "@app/enums/MessageCategory";
import { Message } from "@app/models";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class MessageService {
    private messages: {
        [messageCategory: string]: BehaviorSubject<Message>;
    } = {};

    public sendMessage(
        message: Message,
        category: MessageCategory = MessageCategory.Default) {
        this.initMessages(category);
        this.messages[category].next(message);
    }

    public clearMessage(category: MessageCategory = MessageCategory.Default) {
        this.initMessages(category);
        this.messages[category].next(null);
    }

    public clearAllMessages() {
        for (let category in MessageCategory) {
            const enumCategory: MessageCategory = MessageCategory[category] as any as MessageCategory;
            this.clearMessage(enumCategory);
        }
    }

    public getMessage(category: MessageCategory = MessageCategory.Default): Observable<Message> {
        this.initMessages(category);
        return this.messages[category].asObservable();
    }

    private initMessages(category: MessageCategory) {
        if (!this.messages.hasOwnProperty(category))
            this.messages[category] = new BehaviorSubject<Message>(null);
    }
}

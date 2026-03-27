import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ClientNoteHttpService } from "../../../../services/clientnote-http.service";
import { ErrorMessageHandlerService } from "../../../../services/error-message-handler.service";
import { MessageService } from "../../../../services/message.service";

@Component({
    selector: "underwriter-note-reply",
    templateUrl: "./underwriter-note-reply.component.html",
    styleUrls: ["./underwriter-note-reply.component.scss"],
})

export class UnderwriterNoteReply {
    public replyText: string;
    @Output() public addNote: EventEmitter<string> = new EventEmitter<string>();

    constructor(public clientNoteHttpService: ClientNoteHttpService,
        public messageErrorHandler: ErrorMessageHandlerService,
        public messageService: MessageService) {
    }

    public reply() {
        this.addNote.emit(this.replyText);
        this.replyText = '';
    }
}

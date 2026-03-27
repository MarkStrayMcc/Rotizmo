import { ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Message, MessageCategory, MessageType } from "@app/models";
import { MessageService } from "@app/services/message.service";
import { Subscription } from "rxjs";
import { tap } from "rxjs/operators";

@Component({
    selector: "message",
    templateUrl: "./message.component.html",
    styleUrls: ["./message.component.scss"],
})
export class MessageComponent implements OnInit, OnDestroy {
    @Input("category") public category: MessageCategory = MessageCategory.Default;
    @Input("closable") public closable: boolean = false;
    public subscription: Subscription;
    public lastMessage: Message;
    public messageType = MessageType;

    constructor(private zone: NgZone, private changeDetectorRef: ChangeDetectorRef, public messageService: MessageService) { }

    public ngOnInit(): void {
        this.subscription = this.messageService.getMessage(this.category)
            .pipe(tap(message => {
                this.zone.run(() => { 
                    this.lastMessage = message;
                    this.changeDetectorRef.detectChanges();
                });
            }))
            .subscribe();
    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    public closeAlert() {
        this.lastMessage = undefined;
    }
}

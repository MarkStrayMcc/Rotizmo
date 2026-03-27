/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { APP_BASE_HREF } from "@angular/common";
import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from "@angular/core/testing";
import { BrowserModule } from "@angular/platform-browser";
import { MessageComponent } from "@app/components/message/message.component";
import { Message, MessageCategory, MessageType } from "@app/models";
import { MessageService } from "@app/services/message.service";

let component: MessageComponent;
let fixture: ComponentFixture<MessageComponent>;

describe("MessageComponent", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MessageComponent],
            imports: [BrowserModule],
            providers: [
                { provide: APP_BASE_HREF, useValue: "/" },
                { provide: ComponentFixtureAutoDetect, useValue: true },
                MessageService
            ]
        }).compileComponents().then(() => {
            createComponent();
        });
    }));

    function createComponent() {

        fixture = TestBed.createComponent(MessageComponent);
        component = fixture.componentInstance;
        component.messageService.sendMessage(new Message("Error", MessageType.Error));
    }

    it("show the last error message", async(() => {
        expect(component.lastMessage.text).toBe("Error");
    }));

    it("Clean on only default errors message", async(() => {
        const msg = new Message("RE Error", MessageType.Error);
        let lastMessage: Message;
        let subs = component.messageService.getMessage(MessageCategory.RatingEngine)
            .subscribe(m => lastMessage = m);
        component.messageService.sendMessage(msg, MessageCategory.RatingEngine);
        component.messageService.clearMessage();
        expect(component.lastMessage).toBeNull();
        subs.unsubscribe();
        expect(lastMessage).toBe(msg);
    }));

    it("Clean RatingEngine errors message", async(() => {
        const msg = new Message("RE Error", MessageType.Error);
        let lastMessage: Message;
        let subs = component.messageService.getMessage(MessageCategory.RatingEngine)
            .subscribe(m => lastMessage = m);
        component.messageService.sendMessage(msg, MessageCategory.RatingEngine);
        component.messageService.clearMessage(MessageCategory.RatingEngine);
        subs.unsubscribe();
        expect(lastMessage).toBeNull();
    }));

});

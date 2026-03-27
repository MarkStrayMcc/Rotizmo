import { Component, Input, ChangeDetectionStrategy } from "@angular/core";

@Component({
    selector: "field-message",
    templateUrl: "./field-message.component.html",
    styleUrls: ["./field-message.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldMessageComponent {
    @Input() message: string;
    @Input() type: string;
    @Input() isMessageVisible: boolean = false;
}

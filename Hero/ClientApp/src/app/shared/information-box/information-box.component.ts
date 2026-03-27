import { Component, Input, OnInit } from "@angular/core";

@Component({
	selector: "information-box",
	templateUrl: "information-box.component.html"
})
export class InformationBoxComponent {
    @Input() message: string;
}

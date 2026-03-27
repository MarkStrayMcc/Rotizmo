import { Directive, HostListener } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
    selector: "[uppercase]"
})
export class UppercaseDirective {
    constructor(private control: NgControl) {
    }

    @HostListener("input", ["$event"]) onEvent($event) {
        const value = $event.target.value;
        this.control.control.setValue(value.toUpperCase());
    }
}
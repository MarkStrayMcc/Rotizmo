import { Input, Directive, ElementRef, HostListener, OnInit } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
    selector: "[numberMask]"
})
export class NumberMaskDirective implements OnInit {
    constructor(public el: ElementRef, private control: NgControl) {
    }

    @Input("numberMask") mask: string;

    @HostListener("blur") onBlur() {
        this.applyMask();
    }

    ngOnInit() {
        this.applyMask();
    }

    private applyMask() {
        let inputValue = this.el.nativeElement.value;
        
        // stop if not number or empty
        if (isNaN(+inputValue) || inputValue.length === 0) {
            return;
        }

        const maskedValue = this.applyMaskToNumber(this.mask, inputValue);
        this.control.control.setValue(maskedValue);
    }

    private applyMaskToNumber(mask: string, value: number): string {
        const currentValue = value.toString();
        const sliceSize = currentValue.length > mask.length ? currentValue.length : mask.length;
        const maskedValue = (mask + currentValue).slice(-sliceSize);

        return maskedValue;
    }
}
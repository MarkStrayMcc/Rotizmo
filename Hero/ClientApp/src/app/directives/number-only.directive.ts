import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
    selector: "[number-only]",
})
export class NumberOnly {
    private readonly numberOnlyRegex = new RegExp("^\\d*$");
    private readonly numberOnlyAllowNegativeRegex = new RegExp("^-?\\d*$");
    private readonly numberOnlyAllowDecimalRegex = new RegExp("^\\d*\\.?\\d*$");
    private readonly numberOnlyAllowNegativeAndDecimalRegex = new RegExp("^-?\\d*\\.?\\d*$");
    private readonly allowedSpecialChars: string[] = ["Backspace", "Tab", "Enter", "Escape", "Home", "End", "Left", "ArrowLeft", "Right", "ArrowRight", "Del", "Delete"];
    private readonly allowedCtrlChars: string[] = ["A", "C", "V", "X"];

    constructor(private el: ElementRef) {}

    @Input() public allowNegative: boolean = false;
    @Input() public allowDecimal: boolean = false;

    @HostListener("keydown", ["$event"])
    public onKeyDown(e) {
        const event = e as KeyboardEvent;
        let key: string;

        if (event.key !== undefined) {
            key = event.key;
        } else {
            key = this.getKeyFromCode(event.keyCode);
        }

        if (this.isAllowedKey(key, event.ctrlKey || event.metaKey)) {
            return;
        }

        event.preventDefault();
    }

    @HostListener("paste", ["$event"])
    public onPaste(e) {
        const event = e as ClipboardEvent;
        const content = event.clipboardData.getData("text/plain");

        if (!this.getNumberOnlyRegExp().test(content)) {
            event.preventDefault();
        }
    }

    private getNumberOnlyRegExp(): RegExp {
        if (!this.allowNegative && !this.allowDecimal) {
            return this.numberOnlyRegex;
        } else if (!this.allowNegative) {
            return this.numberOnlyAllowDecimalRegex;
        } else if (!this.allowDecimal) {
            return this.numberOnlyAllowNegativeRegex;
        }

        return this.numberOnlyAllowNegativeAndDecimalRegex;
    }

    private isAllowedKey(key: string, isCtrlDown: boolean): boolean {
        return (this.allowedSpecialChars.indexOf(key) !== -1 ||
            isCtrlDown && this.allowedCtrlChars.indexOf(key.toUpperCase()) !== -1 ||
            this.getNumberOnlyRegExp().test(key));
    }

    // Function used to convert deprecated keyCode to key value
    private getKeyFromCode(keyCode: number): string {
        switch (keyCode) {
            case 8:
                return this.allowedSpecialChars[0];
            case 9:
                return this.allowedSpecialChars[1];
            case 13:
                return this.allowedSpecialChars[2];
            case 27:
                return this.allowedSpecialChars[3];
            case 35:
                return this.allowedSpecialChars[4];
            case 36:
                return this.allowedSpecialChars[5];
            case 37:
                return this.allowedSpecialChars[7];
            case 39:
                return this.allowedSpecialChars[9];
            case 46:
                return this.allowedSpecialChars[11];
            default:
                return String.fromCharCode(keyCode);
        }
    }
}

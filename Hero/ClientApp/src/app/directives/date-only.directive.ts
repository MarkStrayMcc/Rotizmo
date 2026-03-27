import { Directive, HostListener } from "@angular/core";

@Directive({
    selector: "[date-only]",
})
export class DateOnly {
    private readonly dateRegex = new RegExp("^[0-9/]*$");
    private readonly allowedSpecialChars: string[] = [
        "Backspace",
        "Tab",
        "Enter",
        "Escape",
        "Home",
        "End",
        "Left",
        "ArrowLeft",
        "Right",
        "ArrowRight",
        "Del",
        "Delete"];
    private readonly allowedCtrlChars: string[] = ["A", "C", "V", "X"];

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

        if (!this.dateRegex.test(content)) {
            event.preventDefault();
        }
    }

    private isAllowedKey(key: string, isCtrlDown: boolean): boolean {
        return (this.allowedSpecialChars.indexOf(key) !== -1 ||
            isCtrlDown && this.allowedCtrlChars.indexOf(key.toUpperCase()) !== -1 ||
            this.dateRegex.test(key));
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

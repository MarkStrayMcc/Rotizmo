import { Component, Input } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Component({
    selector: "error",
    templateUrl: "./error.component.html",
    styleUrls: ["./error.component.scss"]
})
export class ErrorComponent {

    public objectKeys = Object.keys;

    /**
     * The form control that has the validation and errors we need
     */
    @Input() public formCtrl: AbstractControl;

    /**
     * The text in format: { errorName: 'error text'}
     * If this is not present it will only show the error name e.g. 'invalidDate'
     */
    @Input() public errorText: { [key: string]: string };

    public getErrorText(error: string): string {
        if (this.errorText && this.errorText[error]) {
            return this.errorText[error];
        }
        return error;
    }
}
import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
    selector: "mat-progress-spinner",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockMatSpinner),
            multi: true
        }
    ]
})
export class MockMatSpinner { /**/ }

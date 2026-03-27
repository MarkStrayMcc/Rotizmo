import { AbstractControl, FormGroup, FormArray } from '@angular/forms';

export function markAllAsTouched(controls: { [key: string]: AbstractControl } | AbstractControl[]): void {
    for (const controlName in controls) {
        const control = controls[controlName];

        if (control instanceof FormGroup || control instanceof FormArray) {
            this.markAllAsTouched(control.controls);
        } else {
            control.markAsTouched();
        }
    }
}

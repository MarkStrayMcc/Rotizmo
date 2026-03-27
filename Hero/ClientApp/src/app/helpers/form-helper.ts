export function markFormGroupControlsTouched(formGroup) {
    (Object as any).values(formGroup.controls).forEach(control => {
        control.markAsTouched();

        if (control.controls) {
            markFormGroupControlsTouched(control);
        }
    });
}

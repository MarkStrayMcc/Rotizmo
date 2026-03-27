import { Pipe, PipeTransform } from "@angular/core";
import { DecimalPipe } from "@angular/common";

/**
 *
 */
@Pipe({ name: 'accounting' })
export class AccountsFormatPipe implements PipeTransform {
    constructor(private decimalPipe: DecimalPipe) {
    }

    /**
     *
     * @param value
     * @returns {number}
     */
    transform(value: number): string {
        const abs = Math.abs(value);

        if (value < 0) {
            return '(' + this.decimalPipe.transform(abs, '1.2-2') + ')';
        } else {
            return this.decimalPipe.transform(abs, '1.2-2');
        }
    }
}
import { Pipe, PipeTransform } from "@angular/core";

/**
 *
 */
@Pipe({ name: 'abs' })
export class AbsPipe implements PipeTransform {
    /**
     *
     * @param value
     * @returns {number}
     */
    transform(value: number): number {
        return Math.abs(value);
    }
}
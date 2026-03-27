import { Injectable } from '@angular/core';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { MomentDateAdapter } from '@app/providers/momentDateAdapter';

@Injectable()
export class DateSorterService {
    constructor() {

    }

    public static compareDates(date1: string, date2: string): number {
        let moment1 = MomentDateAdapter.parseString(date1);
        let moment2 = MomentDateAdapter.parseString(date2);
        return moment1.diff(moment2);
    }
}
// Found here: https://github.com/angular/material2/issues/675#issuecomment-302275678

import { DateAdapter, MatDateFormats } from "@angular/material/core";
import { isMoment, Moment } from "moment";
import * as moment from "moment";
import { Injectable } from "@angular/core";

export const MOMENT_DATE_FORMATS: MatDateFormats = {
    parse: {
        dateInput: "DD/MM/YYYY"
    },
    display: {
        dateInput: "DD/MM/YYYY",
        monthYearLabel: "MMMM Y",
        dateA11yLabel: "DD/MM/YYYY",
        monthYearA11yLabel: "MMMM Y"
    }
};

const dateNames: string[] = [];
for (let date = 1; date <= 31; date++) {
    dateNames.push(String(date));
}

@Injectable()
export class MomentDateAdapter extends DateAdapter<Moment> {
    invalid(): Moment {
        return moment.invalid();
    }

    public static parseString(value: string): moment.Moment {
        // Note for future - this could be extended to split by space as well and to
        // translate parts[1] based on looking for months
        if ((!value) || value === "") {
            return null;
        }

        let parts = value.split("/");
        if (parts.length === 1) {
            // format is probably going to be "2018-04-15T00:00:00" or "2018-04-15T00:00:00+01:00"
            // as this will be a redisplay, if not we want to return a null
            parts = value.split("+");
            return moment.utc(parts[0] + "+00:00");
        } else {
            if (parts.length > 3) {
                return moment.invalid();
            }
        }

        /* tslint:disable:prefer-for-of */
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].length === 0) {
                return moment.invalid();
            }
        }
        /* tslint:enable:prefer-for-of */

        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        let year = parts.length === 2 ? (new Date()).getFullYear() : parseInt(parts[2]);
        if (year < 100) {
            if (year > 80) {
                year += 1900;
            } else {
                year += 2000;
            }
        }

        const isoDate = `${year.toString()}-${this.padNumber(month, 2)}-${this.padNumber(day, 2)}T00:00:00+00:00`;
        return moment.utc(isoDate);
    }

    private static padNumber(value: number, length: number): string {
        // only ever going to be used for dates so this is enough zeros
        return ("0000" + value.toString()).slice(-length);
    }

    private localeData = moment.localeData();

    public isDateInstance(obj: any): boolean {
        return this.parse(obj, null) != null;
    }

    public isValid(date: Moment): boolean {
        const m = this.parse(date, null);
        return m != null && m.isValid();
    }

    public getYear(date: Moment): number {
        return date.year();
    }

    public getMonth(date: Moment): number {
        return date.month();
    }

    public getDate(date: Moment): number {
        return date.date();
    }

    public getDayOfWeek(date: Moment): number {
        return date.day();
    }

    public getMonthNames(style: "long" | "short" | "narrow"): string[] {
        switch (style) {
        case "long":
            return this.localeData.months();
        case "short":
            return this.localeData.monthsShort();
        case "narrow":
            return this.localeData.monthsShort().map((month) => month[0]);
        }
    }

    public getDateNames(): string[] {
        return dateNames;
    }

    public getDayOfWeekNames(style: "long" | "short" | "narrow"): string[] {
        switch (style) {
        case "long":
            return this.localeData.weekdays();
        case "short":
            return this.localeData.weekdaysShort();
        case "narrow":
            // Moment does not accept format even though @types/moment suggests it does
            return this.localeData.weekdaysShort();
        }
    }

    public getYearName(date: Moment): string {
        return String(date.year());
    }

    public getFirstDayOfWeek(): number {
        return this.localeData.firstDayOfWeek();
    }

    public getNumDaysInMonth(date: Moment): number {
        return date.daysInMonth();
    }

    public clone(date: Moment): Moment {
        return date.clone();
    }

    public createDate(year: number, month: number, date: number): Moment {
        return moment.utc([year, month, date]);
    }

    public today(): Moment {
        return moment();
    }

    public parse(value: any, parseFormat: any): Moment {
        if ((typeof value) === "string") {
            return MomentDateAdapter.parseString(value);
        }
        return this.parseNonString(value, parseFormat);
    }

    public format(date: Moment, displayFormat: any): string {
        if (date) {
            // Cast of a moment to a moment is to avoid an error on redisplaying dates
            return moment(date).format(displayFormat);
        } else {
            return "";
        }
    }

    public parseNonString(value: any, parseFormat: any): Moment {
        let m = moment(value, parseFormat, true);
        if (!m.isValid()) {
            // try again, forgiving. will get warning if not ISO8601 or RFC2822
            m = moment(value);
        }
        if (m.isValid()) {
            // if user omits year, it defaults to 2001, so check for that issue.
            if (m.year() === 2001 && value && value.indexOf && value.indexOf("2001") === -1) {
                // if 2001 not actually in the value string, change to current year
                const currentYear = new Date().getFullYear();
                m.set("year", currentYear);
                // if date is in the future, set previous year
                if (m.isAfter(moment())) {
                    m.set("year", currentYear - 1);
                }
            }
            return m;
        } else {
            return null;
        }
    }

    public addCalendarYears(date: Moment, years: number): Moment {
        return date.clone().add(years, "y");
    }

    public addCalendarMonths(date: Moment, months: number): Moment {
        return date.clone().add(months, "M");
    }

    public addCalendarDays(date: Moment, days: number): Moment {
        return date.clone().add(days, "d");
    }

    public getISODateString(date: Moment): string {
        return date.toISOString();
    }

    public setLocale(locale: any): void {
        this.localeData = moment.localeData(locale);
    }

    public compareDate(first: Moment, second: Moment): number {
        return first.diff(second, "seconds", true);
    }

    public sameDate(first: any | Moment, second: any | Moment): boolean {
        if (first == null) {
            // same if both null
            return second == null;
        } else if (isMoment(first)) {
            return first.isSame(second);
        } else {
            const isSame = super.sameDate(first, second);
            return isSame;
        }
    }

    public clampDate(date: Moment, min?: any | Moment, max?: any | Moment): Moment {
        if (min && date.isBefore(min)) {
            return min;
        } else if (max && date.isAfter(max)) {
            return max;
        } else {
            return date;
        }
    }

    public toIso8601(date: Moment): string {
        return date.toISOString();
    }

    public fromIso8601(iso8601String: string): Moment  {
        return moment(iso8601String);
    }
}

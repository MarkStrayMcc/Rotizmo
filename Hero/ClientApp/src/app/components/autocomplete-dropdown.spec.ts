import { APP_BASE_HREF } from "@angular/common";
import { fakeAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {RouterModule} from "@angular/router";
import { of } from "rxjs";
import {MaterialModule} from "../material/material.module";
import { AutocompleteDropdown } from "./autocomplete-dropdown";

let fixture: ComponentFixture<AutocompleteDropdown>;

describe("AutocompleteDropdown", () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: APP_BASE_HREF, useValue: "/" }
            ],
            declarations: [
                AutocompleteDropdown
            ],
            imports: [
                BrowserAnimationsModule,
                RouterModule.forRoot([
                    { path: "", redirectTo: "quote", pathMatch: "full" },
                    { path: "**", redirectTo: "quote", pathMatch: "full" }
                ]),
                ReactiveFormsModule,
                MaterialModule
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AutocompleteDropdown);
        fixture.componentInstance.dataSource = of(
            [
                { text: "UK", value: "1", img: "img/flags/GB.png", hidden: "" },
                { text: "Azerbaijan", value: "2", img: "img/flags/AZ.png", hidden: "" },
                { text: "Australia", value: "3", img: "img/flags/AU.png", hidden: "" }
            ]
        );
        fixture.componentInstance.myControl = new FormControl();
    }));

    afterEach(() => {
        fixture = undefined;
    });

    it("get dropdown items on focus", fakeAsync(() => {
        fixture.detectChanges();
        expect(fixture.debugElement.componentInstance.allOptions.length).toEqual(0);
        fixture.debugElement.componentInstance.onFocus();
        expect(fixture.debugElement.componentInstance.allOptions.length).toEqual(3);
    }));

    it("filter finds element", fakeAsync(() => {
        fixture.detectChanges();
        fixture.debugElement.componentInstance.onFocus();
        const result = fixture.componentInstance.filter("Aus");
        const expectedResult = { text: "Australia", value: "3", img: "img/flags/AU.png", hidden: ""};
        expect(result[0]).toEqual(expectedResult);
    }));
});

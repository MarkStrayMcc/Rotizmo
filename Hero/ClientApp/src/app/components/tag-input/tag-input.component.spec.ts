/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { TagInputComponent } from './tag-input.component';
import { MaterialModule } from '@app/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipInputEvent } from '@angular/material/chips';
import { expand } from 'rxjs/operators';

let component: TagInputComponent;
let fixture: ComponentFixture<TagInputComponent>;

describe('tag-input component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TagInputComponent],
            imports: [BrowserModule, MaterialModule, BrowserAnimationsModule],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },

            ]
        });
        fixture = TestBed.createComponent(TagInputComponent);
        component = fixture.componentInstance;
    }));

    it("should not add duplicates by default", async(() => {
        // assemble
        component.writeValue(["jun13"]);
        fixture.detectChanges();

        // act        
        component.checkAndAddTag("jun13");

        // assert
        expect(component.tagValues.length).toBe(1);
    }));

    it("should add items in caps if set to true", async(() => {
        // assemble
        component.allCaps = true;
        component.ngOnChanges({ allCaps: { firstChange: true } });
        fixture.detectChanges();

        // act        
        component.checkAndAddTag("jun13");

        // assert
        expect(component.tagValues.length).toBe(1);
        expect(component.tagValues[0]).toBe("JUN13");
    }));

    it("should only add items based on multiregex", async(() => {
        // assemble
        component.multiRegex = "[a-z][0-9]";
        component.ngOnChanges({ multiRegex: { firstChange: true } });
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            // act
            component.checkAndAddTag("t2");
            component.checkAndAddTag("test");

            // assert
            expect(component.tagValues.length).toBe(1);
            expect(component.tagValues.indexOf("t2")).toBeGreaterThanOrEqual(0);
        });
    }));

    it("should only add one item if matches single regex", async(() => {
        // assemble
        component.singleRegex = "[a-z][0-9]";
        component.ngOnChanges({ singleRegex: { firstChange: true } });
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            // act
            component.checkAndAddTag("t2");
            component.checkAndAddTag("test");
            component.checkAndAddTag("h8");

            // assert
            expect(component.tagValues.length).toBe(1);
            expect(component.tagValues.indexOf("t2")).toBeGreaterThanOrEqual(0);
        });
    }));

    it("should only add items for multiregex if both single and multi defined and multi added already", async(() => {
        // assemble
        component.singleRegex = "[a-z][0-9]";
        component.multiRegex = "[0-9][a-z][a-z]";
        component.ngOnChanges({ singleRegex: { firstChange: true }, multiRegex: { firstChange: true } });
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            // act
            component.checkAndAddTag("2ee");
            component.checkAndAddTag("test");
            component.checkAndAddTag("h8");
            component.checkAndAddTag("9hh");

            // assert
            expect(component.tagValues.length).toBe(2);
            expect(component.tagValues.indexOf("2ee")).toBeGreaterThanOrEqual(0);
            expect(component.tagValues.indexOf("9hh")).toBeGreaterThanOrEqual(0);
        });
    }));
});
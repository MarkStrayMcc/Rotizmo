/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { ErrorComponent } from './error.component';

let component: ErrorComponent;
let fixture: ComponentFixture<ErrorComponent>;

describe('error component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ErrorComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
        fixture = TestBed.createComponent(ErrorComponent);
        component = fixture.componentInstance;
    }));

    it('should return the text given if no error text set up', async(() => {
        // ACT
        let result = component.getErrorText("test");
        // Assert
        expect(result).toBe("test");
    }));

    it('should return the text from the errorText if the keys match', async(() => {
        // Assemble
        component.errorText = {
            someError: "hah, you goofed"
        };

        // ACT
        let result = component.getErrorText("someError");
        // Assert
        expect(result).toBe(component.errorText.someError);
    }));

    it('should return the text given if the errorText keys do not match', async(() => {
        // Assemble
        component.errorText = {
            someError: "hah, you goofed"
        };

        // ACT
        let result = component.getErrorText("someErrorMispelled");
        // Assert
        expect(result).toBe("someErrorMispelled");
    }));
});
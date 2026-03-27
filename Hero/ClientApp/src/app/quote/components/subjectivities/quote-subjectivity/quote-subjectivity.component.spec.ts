/// <reference path="../../../../../../node_modules/@types/jasmine/index.d.ts" />
import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from "@angular/core/testing";
import { BrowserModule, By } from "@angular/platform-browser";
import { QuoteSubjectivityComponent } from "./quote-subjectivity.component";
import { QuoteSubjectivityService } from "@app/services/quote-subjectivity.service";

let component: QuoteSubjectivityComponent;
let fixture: ComponentFixture<QuoteSubjectivityComponent>;

describe("subjectivity component", () => {
    /**
     * QuoteSubjectivityService has its own tests, so let us not test that here
     * give a mock/stub instead
     */
    class QuoteSubjectivityServiceSpy {
        formatSubjectivityDisplayText = jasmine.createSpy("formatSubjectivityDisplayText");
    }
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [QuoteSubjectivityComponent],
            imports: [BrowserModule],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },
                {
                    provide: QuoteSubjectivityService, useClass: QuoteSubjectivityServiceSpy
                }
            ]
        });
        fixture = TestBed.createComponent(QuoteSubjectivityComponent);
        component = fixture.componentInstance;
    }));

    it("should do something", async(() => {
        expect(true).toEqual(true);
    }));
});

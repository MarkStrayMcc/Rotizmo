/// <reference path="../../../../../../node_modules/@types/jasmine/index.d.ts" />
import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from "@angular/core/testing";
import { BrowserModule, By } from "@angular/platform-browser";
import { QuoteSubjectivitiesHandlerService } from "@app/quote/components/subjectivities/quote-subjectivities-handler/quote-subjectivities-handler.service";
import { QuoteSubjectivitiesListComponent } from "@app/quote/components/subjectivities/quote-subjectivities-list/quote-subjectivities-list.component";
import { QuoteSubjectivityComponent } from "@app/quote/components/subjectivities/quote-subjectivity/quote-subjectivity.component";
import { QuoteSubjectivityService } from "@app/services/quote-subjectivity.service";

let component: QuoteSubjectivitiesListComponent;
let fixture: ComponentFixture<QuoteSubjectivitiesListComponent>;

describe("subjectivities-list component", () => {
    /**
     * QuoteSubjectivitiesHandlerService stub for testing
     */
    // tslint:disable-next-line: max-classes-per-file
    class QuoteSubjectivitiesHandlerSpy {
        public addQuoteSubjectivity = jasmine.createSpy("addQuoteSubjectivity");
        public removeQuoteSubjectivity = jasmine.createSpy("removeQuoteSubjectivity");
    }

    /**
     * QuoteSubjectivityService has its own tests, so let us not test that here
     * give a mock/stub instead
     */
    // tslint:disable-next-line: max-classes-per-file
    class QuoteSubjectivityServiceSpy {
        public formatSubjectivityDisplayText = jasmine.createSpy("formatSubjectivityDisplayText");
    }

    beforeEach(async(() => {
        /**
         * QuoteSubjectivitiesListComponent uses QuoteSubjectivityComponent.
         * So import QuoteModule and Declare QuoteSubjectivityComponent too
         */
        TestBed.configureTestingModule({
            declarations: [QuoteSubjectivitiesListComponent, QuoteSubjectivityComponent],
            imports: [BrowserModule],
            providers: [
                {
                    provide: ComponentFixtureAutoDetect, useValue: true
                },
                {
                    provide: QuoteSubjectivitiesHandlerService, useClass: QuoteSubjectivitiesHandlerSpy
                },
                {
                    provide: QuoteSubjectivityService, useClass: QuoteSubjectivityServiceSpy
                }
            ]
        });
        fixture = TestBed.createComponent(QuoteSubjectivitiesListComponent);
        component = fixture.componentInstance;
    }));

    it("should do something", async(() => {
        expect(true).toEqual(true);
    }));
});

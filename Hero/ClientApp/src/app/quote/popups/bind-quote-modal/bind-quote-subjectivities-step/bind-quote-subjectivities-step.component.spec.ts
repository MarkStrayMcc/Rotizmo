/* tslint:disable:max-classes-per-file */
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { QuoteSubjectivity } from "@app/models";
import { QuoteSubjectivityService } from "@app/services/quote-subjectivity.service";
import { BindQuoteSubjectivitiesStepComponent } from "@app/quote/popups/bind-quote-modal/bind-quote-subjectivities-step/bind-quote-subjectivities-step.component";

describe("BindQuoteSubjectivitiesStepComponent", () => {
    let component: BindQuoteSubjectivitiesStepComponent;
    let fixture: ComponentFixture<BindQuoteSubjectivitiesStepComponent>;
    let quoteSubjectivityService: QuoteSubjectivityService;
    let onChangeCallCount: number;
    let onTouchedCallCount: number;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BindQuoteSubjectivitiesStepComponent],
            providers: [{ provide: QuoteSubjectivityService, useClass: MockQuoteSubjectivityService }]
        }).compileComponents();
    }));

    beforeEach(() => {
        quoteSubjectivityService = TestBed.inject(QuoteSubjectivityService);
        fixture = TestBed.createComponent(BindQuoteSubjectivitiesStepComponent);
        component = fixture.componentInstance;
        component.writeValue(getTestSubjectivities());
        component.registerOnChange(fakeOnChange);
        component.registerOnTouched(fakeOnTouched);
        onChangeCallCount = 0;
        onTouchedCallCount = 0;
        fixture.detectChanges();
    });

    it("Should create component", () => {
        expect(component).toBeTruthy();
    });

    it("Should return a list containing only prior binding subjectivities", () => {
        // Actions
        const result = component.priorSubjectivities;

        // Asserts
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        expect(result.every((r) => !r.isPost)).toBeTruthy();
    });

    it("Should return a list containing only post binding subjectivities", () => {
        // Actions
        const result = component.postSubjectivities;

        // Asserts
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        expect(result.every((r) => r.isPost)).toBeTruthy();
    });

    it("Should call the quote subjectivity service to format text for display", () => {
        // Actors
        spyOn(quoteSubjectivityService, "formatSubjectivityDisplayText");
        const testSubjectivity = getTestSubjectivities()[0];

        // Actions
        component.getSubjectivityDisplayText(testSubjectivity);

        // Asserts
        expect(quoteSubjectivityService.formatSubjectivityDisplayText).toHaveBeenCalledTimes(1);
        expect(quoteSubjectivityService.formatSubjectivityDisplayText).toHaveBeenCalledWith(testSubjectivity);
    });

    it("Should delete a prior binding subjectivity", () => {
        // Actors
        const testSubjectivity = component.priorSubjectivities[0];
        const subjectivityExistsInitial = component.priorSubjectivities.findIndex((s) => s === testSubjectivity) !== -1;

        // Actions
        component.deleteSubjectivity(testSubjectivity);
        const subjectivityExistsFinal = component.priorSubjectivities.findIndex((s) => s === testSubjectivity) !== -1;

        // Asserts
        expect(testSubjectivity).toBeDefined();
        expect(subjectivityExistsInitial).toBeTruthy();
        expect(subjectivityExistsFinal).toBeFalsy();
        expect(onChangeCallCount).toBe(1);
        expect(onTouchedCallCount).toBe(1);
    });

    it("Should delete a post binding subjectivity", () => {
        // Actors
        const testSubjectivity = component.postSubjectivities[0];
        const subjectivityExistsInitial = component.postSubjectivities.findIndex((s) => s === testSubjectivity) !== -1;

        // Actions
        component.deleteSubjectivity(testSubjectivity);
        const subjectivityExistsFinal = component.postSubjectivities.findIndex((s) => s === testSubjectivity) !== -1;

        // Asserts
        expect(testSubjectivity).toBeDefined();
        expect(subjectivityExistsInitial).toBeTruthy();
        expect(subjectivityExistsFinal).toBeFalsy();
        expect(onChangeCallCount).toBe(1);
        expect(onTouchedCallCount).toBe(1);
    });

    it("Should not try to delete a nonexistent subjectivity", () => {
        // Actors
        const nonExistentSubjectivity = {
            subjectivity: {
                subjectivityId: 10,
                text: "Fake subjectivity"
            },
            isPost: false,
            days: 0
        } as QuoteSubjectivity;
        const subjectivityExistsInitial =
            component.postSubjectivities.findIndex((s) => s === nonExistentSubjectivity) !== -1;

        // Actions
        component.deleteSubjectivity(nonExistentSubjectivity);
        const subjectivityExistsFinal =
            component.postSubjectivities.findIndex((s) => s === nonExistentSubjectivity) !== -1;

        // Asserts
        expect(nonExistentSubjectivity).toBeDefined();
        expect(subjectivityExistsInitial).toBeFalsy();
        expect(subjectivityExistsFinal).toBeFalsy();
        expect(onChangeCallCount).toBe(0);
        expect(onTouchedCallCount).toBe(0);
    });

    it("Should flip a subjectivity from prior to post binding", () => {
        // Actors
        const testSubjectivity = component.priorSubjectivities[0];
        const isPostInitial = testSubjectivity.isPost;

        // Actions
        component.flipSubjectivity(testSubjectivity);
        const priorSubjectivityExists =
            component.priorSubjectivities.findIndex((subjectivity) => subjectivity === testSubjectivity) !== -1;
        const postSubjectivityExists =
            component.postSubjectivities.findIndex((subjectivity) => subjectivity === testSubjectivity) !== -1;

        // Asserts
        expect(isPostInitial).toBeFalsy();
        expect(priorSubjectivityExists).toBeFalsy();
        expect(testSubjectivity.isPost).toBeTruthy();
        expect(postSubjectivityExists).toBeTruthy();
        expect(onChangeCallCount).toBe(1);
        expect(onTouchedCallCount).toBe(1);
    });

    it("Should not flip a subjectivity from post to prior binding", () => {
        // Actors
        const testSubjectivity = component.postSubjectivities[0];
        const isPostInitial = testSubjectivity.isPost;

        // Actions
        component.flipSubjectivity(testSubjectivity);
        const priorSubjectivityExists =
            component.priorSubjectivities.findIndex((subjectivity) => subjectivity === testSubjectivity) !== -1;
        const postSubjectivityExists =
            component.postSubjectivities.findIndex((subjectivity) => subjectivity === testSubjectivity) !== -1;

        // Asserts
        expect(isPostInitial).toBeTruthy();
        expect(priorSubjectivityExists).toBeFalsy();
        expect(testSubjectivity.isPost).toBeTruthy();
        expect(postSubjectivityExists).toBeTruthy();
        expect(onChangeCallCount).toBe(0);
        expect(onTouchedCallCount).toBe(1);
    });

    it("Should flip a subjectivity to 14 days if there are no other post binding subjectivities", () => {
        // Actors
        component.writeValue(getTestSubjectivities().filter((subjectivity) => !subjectivity.isPost));
        const testSubjectivity = component.priorSubjectivities[0];
        const isPostInitial = testSubjectivity.isPost;
        const daysInitial = testSubjectivity.days;
        const postSubjectivitiesLengthInitial = component.postSubjectivities.length;

        // Actions
        component.flipSubjectivity(testSubjectivity);

        // Asserts
        expect(isPostInitial).toBeFalsy();
        expect(daysInitial).toBe(0);
        expect(postSubjectivitiesLengthInitial).toBe(0);
        expect(testSubjectivity.isPost).toBeTruthy();
        expect(testSubjectivity.days).toBe(14);
        expect(component.postSubjectivities.length).toBe(1);
        expect(onChangeCallCount).toBe(1);
        expect(onTouchedCallCount).toBe(1);
    });

    it("Should flip a subjectivity to the highest number of days from post binding subjectivities", () => {
        // Actors
        const testSubjectivities = getTestSubjectivities();
        const longSubjectivity = {
            subjectivity: {
                subjectivityId: 5,
                text: "Test subjectivity 5"
            },
            isPost: true,
            days: 150
        } as QuoteSubjectivity;
        testSubjectivities.push(longSubjectivity);
        component.writeValue(testSubjectivities);
        const testSubjectivity = component.priorSubjectivities[0];
        const isPostInitial = testSubjectivity.isPost;
        const daysInitial = testSubjectivity.days;

        // Actions
        component.flipSubjectivity(testSubjectivity);

        // Asserts
        expect(isPostInitial).toBeFalsy();
        expect(daysInitial).toBe(0);
        expect(testSubjectivity.isPost).toBeTruthy();
        expect(testSubjectivity.days).toBe(150);
        expect(onChangeCallCount).toBe(1);
        expect(onTouchedCallCount).toBe(1);
    });

    it("Should return error when there are still prior binding subjectivities on validation", () => {
        // Actions
        const result = component.validate(null);

        // Asserts
        expect(result).toBeTruthy();
        expect(result.hasOwnProperty("onlyPost")).toBeTruthy();
        expect(result.onlyPost.hasOwnProperty("valid")).toBeTruthy();
        expect(result.onlyPost.valid).toBeFalsy();
    });

    it("Should return null when there are only post binding subjectivities on validation", () => {
        // Actors
        component.writeValue(getTestSubjectivities().filter((subjectivity) => subjectivity.isPost));

        // Actions
        const result = component.validate(null);

        // Asserts
        expect(result).toBeNull();
    });

    function getTestSubjectivities(): QuoteSubjectivity[] {
        return [
            {
                subjectivity: {
                    subjectivityId: 1,
                    text: "Test subjectivity 1"
                },
                isPost: false,
                days: 0
            },
            {
                subjectivity: {
                    subjectivityId: 2,
                    text: "Test subjectivity 2"
                },
                isPost: true,
                days: 14
            },
            {
                subjectivity: {
                    subjectivityId: 3,
                    text: "Test subjectivity 3"
                },
                isPost: false,
                days: 0
            },
            {
                subjectivity: {
                    subjectivityId: 4,
                    text: "Test subjectivity 4"
                },
                isPost: true,
                days: 7
            }
        ] as QuoteSubjectivity[];
    }

    function fakeOnChange(subjectivity: QuoteSubjectivity) {
        onChangeCallCount++;
    }

    function fakeOnTouched(subjectivity: QuoteSubjectivity) {
        onTouchedCallCount++;
    }
});

class MockQuoteSubjectivityService {
    public formatSubjectivityDisplayText(subjectivity: QuoteSubjectivity): string {
        return "";
    }
}

import { fakeAsync, tick, discardPeriodicTasks } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { ActivityService } from "@app/quote/services/activity.service";
import { QuoteService } from "@app/quote/services/quote.service";
import { first } from "rxjs/operators";
import { ActivityListComponent } from "../activity-list/activity-list.component";
import { ActivitySearchComponent } from "./activity-search.component";
import * as mocks from "./activity-search.component.mock";

describe('ActivitySearchComponent', () => {
    let component: ActivitySearchComponent;
    let fakeListComponent: ActivityListComponent;
    let activityService = mocks.mockActivityService;
    let formBuilder: FormBuilder;

    beforeEach(() => {
        component = new ActivitySearchComponent(fakeListComponent, activityService as unknown as ActivityService, formBuilder, mocks.mockQuoteService as QuoteService);
        component["formBuilder"] = new FormBuilder();
    });

    it('should create ActivitySearchComponent', () => {
        expect(component).toBeTruthy();
    });

    it('should create the activity form on init', () => {
        // Act
        component.ngOnInit();

        //Assert
        expect(component.activityForm).toBeDefined();
    });

    it('should set the selected activity', () => {
        //Act
        component.ngOnInit();

        //Assert
        component.activityForm.controls.activity.valueChanges.subscribe(value => {
            expect(value).toBeDefined();
            expect(component["listComponent"]).toBeDefined();
            expect(component["listComponent"].showAddBtn).toBeTruthy();
            expect(component.thisActivity.code).toEqual("ED");
        });
    });

    describe("isLoadingActivities$", () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should initialise as false', async () => {
            const isLoading$ = await component.isLoadingActivities$.pipe(first()).toPromise();
            expect(isLoading$).toBe(false);
        });

        it('should be false once activities have been loaded', fakeAsync(async () => {
            component.activityForm.controls.activity.setValue("test");
            tick(500);
            const isLoading$ = await component.isLoadingActivities$.pipe(first()).toPromise();
            expect(isLoading$).toBe(false);
        }));
    });
});

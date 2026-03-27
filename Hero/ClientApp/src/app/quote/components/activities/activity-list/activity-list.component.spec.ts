/* tslint:disable:max-classes-per-file */
import { APP_BASE_HREF } from "@angular/common";
import { ComponentFixture, inject } from "@angular/core/testing";
import { Activity, ActivityMap } from "@app/models";
import { ActivityListComponent } from "@app/quote/components/activities/activity-list/activity-list.component";
import { QuoteModule } from "@app/quote/quote.module";
import { ActivityService } from "@app/quote/services/activity.service";
import { ProductHttpService } from "@app/services/product-http.service";
import { UnderwriterActivityValidationService } from "@app/services/UnderwriterValidation/underwriter-activity-validation.service";
import { UserService } from "@app/services/user.service";

import { Observable, of, Subscriber } from "rxjs";
import { first } from "rxjs/operators";
import { Shallow } from "shallow-render";
import { getTestQuote } from "../../../../../test-helpers/index";

describe("ActivityListComponent", () => {
	let shallow: Shallow<ActivityListComponent>;
	let component: ActivityListComponent;
	let componentFixture: ComponentFixture<ActivityListComponent>;

	let injector: any;

	beforeEach(async () => {
		shallow = new Shallow(ActivityListComponent, QuoteModule)
			.provideMock({ provide: ActivityService, useClass: MockActivityService })
			.provideMock({ provide: APP_BASE_HREF, useValue: "/" })
			.mock(UserService, { isFeatureAccessible: (_: string) => false })
			.mock(ProductHttpService, { isSearchableProduct: (_: string) => of(false) })
			.mock(UnderwriterActivityValidationService, { getMaximumActivityPercentage: () => 100 });

		const { instance, fixture, inject } = await shallow.render({ detectChanges: false });
		component = instance;
		componentFixture = fixture;
		injector = inject;

		component.activities = [];
		component.vm = getTestQuote();
	});

	describe("activities", () => {
		beforeEach(() => {
			componentFixture.detectChanges();
		});

		it("Should have one activity on initialisation", () => {
			expect(component.activities.length).toBe(1);
			expect(component.activities[0].availableActivities.length).toBe(3);
		});

		it("Should add an activity to quote on confirmation", async () => {
			// Actors
			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			component.activityAddForm.controls.percentageInput.setValue(50);

			// Actions
			component.confirmActivity(await component.isProductSearchable$.toPromise());

			// Asserts
			expect(component.totalPercentage).toBe(50);
			expect(component.vm.activities.length).toBe(1);
			expect(component.vm.activities[0].activityMaps.length).toBe(2);
			expect(component.vm.activities[0].activityMaps[0].code).toBe(getTestActivities()[0].code);
		});

		it("Should be invalid if try to add second percentage greater than max available", async () => {
			// Actors
			selectActivity(1, getTestActivities()[0]);
			component.activityAddForm.controls.percentageInput.setValue(50);
			component.confirmActivity(await component.isProductSearchable$.toPromise());

			selectActivity(1, getTestActivities()[1]);

			// Actions
			component.activityAddForm.controls.percentageInput.setValue(60);

			// Asserts
			expect(component.activityAddForm.valid).toBeFalsy();
		});

		it("Should remove an activity from quote on removal", async () => {
			// Actors
			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			component.confirmActivity(await component.isProductSearchable$.toPromise());
			const initialNumberOfQuoteActivities = component.vm.activities.length;

			// Actions
			component.removeActivity(0);

			// Asserts
			expect(component.totalPercentage).toBe(0);
			expect(initialNumberOfQuoteActivities).toBe(1);
			expect(component.vm.activities.length).toBe(0);
		});

		it("Should load children activities of an activity on selection", async () => {
			// Actions
			selectActivity(1, getTestActivities()[0]);

			// Asserts
			expect(component.activities.length).toBe(2);
			expect(component.activities[0].code).toBe(getTestActivities()[0].code);
			expect(component.activities[1].availableActivities.length).toBe(2);
			expect(component.activities[1].availableActivities[1].code).toBe(getTestActivities()[5].code);
		});

		it("Should remove an already selected level 2 activity from available activities", async () => {
			// Actors
			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			selectActivity(2, getTestActivities()[3]);

			// Actions
			component.confirmActivity(await component.isProductSearchable$.toPromise());
			selectActivity(1, getTestActivities()[0]);

			// Asserts
			expect(component.activityAdded.emit).toHaveBeenCalledTimes(1);

			expect(component.vm.activities.length).toBe(1);
			expect(component.vm.activities[0].activityMaps.length).toBe(2);
			expect(component.vm.activities[0].activityMaps[1].code).toBe(getTestActivities()[3].code);

			expect(component.activities.length).toBe(2);
			expect(component.activities[0].code).toBe(getTestActivities()[0].code);
			expect(component.activities[1].availableActivities.length).toBe(1);
			expect(component.activities[1].availableActivities[0].code).toBe(getTestActivities()[5].code);
		});

		it("Should not remove an already selected level 2 activity from under a different parent", async () => {
			// Actors
			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			selectActivity(2, getTestActivities()[3]);

			// Actions
			component.confirmActivity(await component.isProductSearchable$.toPromise());
			selectActivity(1, getTestActivities()[1]);

			// Asserts
			expect(component.activityAdded.emit).toHaveBeenCalledTimes(1);

			expect(component.vm.activities.length).toBe(1);
			expect(component.vm.activities[0].activityMaps.length).toBe(2);
			expect(component.vm.activities[0].activityMaps[1].code).toBe(getTestActivities()[3].code);

			expect(component.activities.length).toBe(2);
			expect(component.activities[0].code).toBe(getTestActivities()[1].code);
			expect(component.activities[1].availableActivities.length).toBe(2);
			expect(component.activities[1].availableActivities[0].code).toBe(getTestActivities()[4].code);
		});

		it("Should show a previously selected level 2 activity which has been removed as available again", async () => {
			// Actors
			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			selectActivity(2, getTestActivities()[3]);

			// Actions
			component.confirmActivity(await component.isProductSearchable$.toPromise());
			component.removeActivity(0);
			selectActivity(1, getTestActivities()[0]);

			// Asserts
			expect(component.activityAdded.emit).toHaveBeenCalledTimes(1);

			expect(component.vm.activities.length).toBe(0);

			expect(component.activities.length).toBe(2);
			expect(component.activities[0].code).toBe(getTestActivities()[0].code);
			expect(component.activities[1].availableActivities.length).toBe(2);
			expect(component.activities[1].availableActivities[0].code).toBe(getTestActivities()[3].code);
		});

		it("Should remove a level 1 activity from available activities when all its children have been selected", async () => {
			// Actors
			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			selectActivity(2, getTestActivities()[3]);

			// Actions
			component.confirmActivity(await component.isProductSearchable$.toPromise());

			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			selectActivity(2, getTestActivities()[5]);
			component.confirmActivity(await component.isProductSearchable$.toPromise());

			// Asserts
			expect(component.activityAdded.emit).toHaveBeenCalledTimes(2);

			expect(component.vm.activities.length).toBe(2);
			expect(component.vm.activities[0].activityMaps.length).toBe(2);
			expect(component.vm.activities[0].activityMaps[1].code).toBe(getTestActivities()[3].code);
			expect(component.vm.activities[1].activityMaps.length).toBe(2);
			expect(component.vm.activities[1].activityMaps[1].code).toBe(getTestActivities()[5].code);

			expect(component.activities.length).toBe(1);
			expect(component.activities[0].availableActivities.length).toBe(2);
			expect(component.activities[0].availableActivities[0].code).toBe(getTestActivities()[1].code);
		});

		it("Should show as available a previously selected level 1 activity for which a children has been removed", async () => {
			// Actors
			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			selectActivity(2, getTestActivities()[3]);
			component.confirmActivity(await component.isProductSearchable$.toPromise());

			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			selectActivity(2, getTestActivities()[5]);
			component.confirmActivity(await component.isProductSearchable$.toPromise());

			// Actions
			component.removeActivity(0);

			// Asserts
			expect(component.activityAdded.emit).toHaveBeenCalledTimes(2);

			expect(component.vm.activities.length).toBe(1);
			expect(component.vm.activities[0].activityMaps.length).toBe(2);
			expect(component.vm.activities[0].activityMaps[1].code).toBe(getTestActivities()[5].code);

			expect(component.activities.length).toBe(1);
			expect(component.activities[0].availableActivities.length).toBe(3);
			expect(component.activities[0].availableActivities[0].code).toBe(getTestActivities()[0].code);
		});

		it("Should show as available a previously selected level 2 activity whose parent is available again", async () => {
			// Actors
			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			selectActivity(2, getTestActivities()[3]);
			component.confirmActivity(await component.isProductSearchable$.toPromise());

			component.isSearchEnabledForAllProducts = false;
			selectActivity(1, getTestActivities()[0]);
			selectActivity(2, getTestActivities()[5]);
			component.confirmActivity(await component.isProductSearchable$.toPromise());

			// Actions
			component.removeActivity(0);
			selectActivity(1, getTestActivities()[0]);

			// Asserts
			expect(component.activityAdded.emit).toHaveBeenCalledTimes(2);

			expect(component.vm.activities.length).toBe(1);
			expect(component.vm.activities[0].activityMaps.length).toBe(2);
			expect(component.vm.activities[0].activityMaps[1].code).toBe(getTestActivities()[5].code);

			expect(component.activities.length).toBe(2);
			expect(component.activities[0].availableActivities.length).toBe(3);
			expect(component.activities[0].availableActivities[0].code).toBe(getTestActivities()[0].code);
			expect(component.activities[1].availableActivities.length).toBe(1);
			expect(component.activities[1].availableActivities[0].code).toBe(getTestActivities()[3].code);
		});
	});

	describe("isSearchable$", () => {
		let mockUserService;
		beforeEach(() => {
			mockUserService = injector(UserService);
		});

		it("should call the product http service if feature is activated", async () => {
			// Arrange
			const mockProductHttpService = injector(ProductHttpService);
			mockUserService.isFeatureAccessible = jasmine.createSpy().and.returnValue(true);
			// Act
			componentFixture.detectChanges();
			await component.isProductSearchable$.pipe(first()).toPromise();

			// Assert
			expect(mockProductHttpService.isSearchableProduct).toHaveBeenCalledTimes(1);
		});

		it("should not call the product http service if feature is not activated", async () => {
			// Arrange
			const mockProductHttpService = injector(ProductHttpService);
			mockUserService.isFeatureAccessible = jasmine.createSpy().and.returnValue(false);

			// Act
			componentFixture.detectChanges();
			await component.isProductSearchable$.pipe(first()).toPromise();

			// Assert
			expect(mockProductHttpService.isSearchableProduct).toHaveBeenCalledTimes(0);
		});

		it("should return false for isSearchable$", async () => {
			// Act
			componentFixture.detectChanges();
			var result = await component.isProductSearchable$.pipe(first()).toPromise();

			// Assert
			expect(result).toBe(false);
		});

		describe("feature flag heroActivitySearch is on", () => {
			beforeEach(() => {
				mockUserService.isFeatureAccessible = jasmine.createSpy().and.returnValue(true);
			});

			it("should return false for isSearchable$ when productHttpService.isSearchableProduct returns false ", async () => {
				// Act
				componentFixture.detectChanges();
				var result = await component.isProductSearchable$.pipe(first()).toPromise();

				// Assert
				expect(result).toBe(false);
			});

			it("should return true for isSearchable$ when productHttpService.isSearchableProduct returns true ", async () => {
				// Arrange
				const mockProductHttpService = injector(ProductHttpService);
				mockProductHttpService.isSearchableProduct = jasmine.createSpy().and.returnValue(of(true));

				// Act
				componentFixture.detectChanges();
				var result = await component.isProductSearchable$.pipe(first()).toPromise();

				// Assert
				expect(result).toBe(true);
			});
		});
	});

	function selectActivity(level: number, activity: Activity) {
		const selectedActivity = component.activities[level - 1];
		selectedActivity.activityMapId = activity.activityMapId;
		selectedActivity.parentActivityMapId = activity.parentActivityMapId;
		selectedActivity.activityMasterId = activity.activityMasterId;
		selectedActivity.code = activity.code;
		selectedActivity.description = activity.description;
		component.addChild(selectedActivity.activityMapId);
	}
});

class MockActivityService {
	public searchByProductCodeAndActivityName = fakeSearchActivityResponse;
	public getActivityByProductIdAndParentId = fakeGetActivityByProductIdAndParentId;
	public getActivityByProductCodeAndActivityCode = fakeGetActivityByProductCodeAndActivityCodeResponse;
}

const activitiesList1 = [getTestActivities()[0], getTestActivities()[1], getTestActivities()[2]];

const activitiesList2 = [getTestActivities()[3], getTestActivities()[5]];

const activitiesList3 = [getTestActivities()[4], getTestActivities()[6]];

function fakeGetActivityByProductIdAndParentId(productId: number, parentId?: number): Observable<Activity> {
	switch (parentId) {
		case null:
			return Observable.create((observer: Subscriber<any>) => {
				observer.next(activitiesList1);
				observer.complete();
			});
		case 1:
			return Observable.create((observer: Subscriber<any>) => {
				observer.next(activitiesList2);
				observer.complete();
			});
		case 2:
			return Observable.create((observer: Subscriber<any>) => {
				observer.next(activitiesList3);
				observer.complete();
			});
		default:
			return Observable.create((observer: Subscriber<any>) => {
				observer.next();
				observer.complete();
			});
	}
}

function fakeSearchActivityResponse() {
	return of([
		{
			activityCode: "ED",
			searchableTerm: "Education",
		},
		{
			activityCode: "ED03",
			searchableTerm: "Education > Colleges & Universities",
		},
		{
			activityCode: "ED0301",
			searchableTerm: "Education > Colleges & Universities > Further Education College",
		},
	]);
}

function fakeGetActivityByProductCodeAndActivityCodeResponse() {
	return of([
		<ActivityMap>{
			activityMapId: 127,
			activityMasterId: 114,
			code: "ED",
			description: "Education",
			numberOfAvailableActivities: 15,
			parentActivityMapId: null,
			productId: 0,
		},
		<ActivityMap>{
			activityMapId: 136,
			activityMasterId: 123,
			code: "ED03",
			description: "Colleges & Universities",
			numberOfAvailableActivities: 5,
			parentActivityMapId: 127,
			productId: 0,
		},
		<ActivityMap>{
			activityMapId: 137,
			activityMasterId: 124,
			code: "ED0301",
			description: "Further Education College",
			numberOfAvailableActivities: 3,
			parentActivityMapId: 136,
			productId: 0,
		},
	]);
}

function getTestActivities(): Activity[] {
	return [
		{
			activityMapId: 1,
			activityMasterId: 1,
			code: "NOT_FOR_PROFIT",
			description: "Not For Profit",
			parentActivityMapId: null,
			availableActivities: [],
			level: 1,
		},
		{
			activityMapId: 2,
			activityMasterId: 2,
			code: "PRIVATE_COMPANY",
			description: "Private Company",
			parentActivityMapId: null,
			availableActivities: [],
			level: 1,
		},
		{
			activityMapId: 3,
			activityMasterId: 3,
			code: "PUBLIC_COMPANY",
			description: "Public Company",
			parentActivityMapId: null,
			availableActivities: [],
			level: 1,
		},
		{
			activityMapId: 4,
			activityMasterId: 4,
			code: "AGRICULTURE_ENVIRONMENTAL",
			description: "Agriculture & Environmental",
			parentActivityMapId: 1,
			availableActivities: [],
			level: 2,
		},
		{
			activityMapId: 5,
			activityMasterId: 4,
			code: "AGRICULTURE_ENVIRONMENTAL",
			description: "Agriculture & Environmental",
			parentActivityMapId: 2,
			availableActivities: [],
			level: 2,
		},
		{
			activityMapId: 6,
			activityMasterId: 5,
			code: "HEALTHCARE",
			description: "Healthcare",
			parentActivityMapId: 1,
			availableActivities: [],
			level: 2,
		},
		{
			activityMapId: 7,
			activityMasterId: 6,
			code: "FINANCIAL_INSTITUTIONS",
			description: "Financial Institutions",
			parentActivityMapId: 2,
			availableActivities: [],
			level: 2,
		},
	] as Activity[];
}

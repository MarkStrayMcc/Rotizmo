import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IsValid } from "@app/interfaces/IsValid";
import { Activity, ActivityDetail, ActivityMap, Quote, QuoteState } from "@app/models";
import { ActivitySelectorComponent } from "@app/quote/components/activities/activity-selector/activity-selector.component";
import { ActivityService } from "@app/quote/services/activity.service";
import { ProductHttpService } from "@app/services/product-http.service";
import { UnderwriterActivityValidationService } from "@app/services/UnderwriterValidation/underwriter-activity-validation.service";
import { UserService } from "@app/services/user.service";
import { Observable, of, ReplaySubject } from "rxjs";
import { first, map, takeUntil } from "rxjs/operators";

@Component({
	selector: "activity-list",
	templateUrl: "activity-list.component.html",
	styleUrls: ["activity-list.component.scss"],
})
export class ActivityListComponent implements OnInit, IsValid, OnDestroy {
	@Input("validatePercentage") public validatePercentage: boolean = false;
	@Input("activityListVm") public vm: Quote;
	@Input() public readonly: boolean;

	@Output() public activityAdded = new EventEmitter();
	@Output() public onChange = new EventEmitter();
	@Output() public loaded: EventEmitter<boolean> = new EventEmitter();

	@ViewChild(ActivitySelectorComponent)
	public activitySelector: ActivitySelectorComponent;

	public activities = new Array<Activity>();
	public excludedActivities: Activity[] = [];
	public showAddBtn: boolean = false;
	public activityAddForm: FormGroup;
	public valid = true;
	public hasUnderwriterWarning: boolean = false;
	public selectedActivityTree;
	public isProductSearchable$: Observable<boolean>;
	private isHeroActivitySearchActive = false;
	public isSearchEnabledForAllProducts = false;

	public get productId() {
		if (this.vm) {
			return this.vm.product.productId;
		}
		return 0;
	}

	public get totalPercentage() {
		let sum: number = 0;
		if (this.vm) {
			for (const act of this.vm.activities) {
				sum += act.percent;
			}
		}

		return sum;
	}

	public get maxPercentage(): number {
		return 100 - this.totalPercentage;
	}

	private readonly _destroyed$ = new ReplaySubject<void>(1);

	constructor(
		private readonly activityService: ActivityService,
		private readonly formBuilder: FormBuilder,
		private underwriterActivityValidationService: UnderwriterActivityValidationService,
		private userService: UserService,
		private productService: ProductHttpService
	) {}

	public ngOnInit() {
		this.addChild(null);
		this.activityAddForm = this.formBuilder.group({
			percentageInput: [this.maxPercentage, [Validators.required, Validators.min(1), Validators.max(this.maxPercentage)]],
		});

		this.activityAddForm.valueChanges.pipe(takeUntil(this._destroyed$)).subscribe((data) => this.onValueChanged(data));

		this.isHeroActivitySearchActive = this.userService.isFeatureAccessible("heroActivitySearch");
		if (this.isHeroActivitySearchActive === true) {
			this.isProductSearchable$ = this.productService
				.isSearchableProduct(this.vm.product.productName)
				.pipe(map((isActivtySearchEnabled) => isActivtySearchEnabled));
		} else {
			this.isProductSearchable$ = of(false);
		}
		this.isSearchEnabledForAllProducts = !this.isHeroActivitySearchActive;
	}

	public ngOnChanges(changes: any): void {
		if (changes && changes.vm && changes.vm.firstChange) {
			if (!this.vm.activities) {
				this.vm.activities = new Array<ActivityDetail>();
			} else {
				this.removeActivitiesFromList();
			}
		}
	}

	public ngOnDestroy(): void {
		this._destroyed$.next();
		this._destroyed$.complete();
	}

	public isValid() {
		if (this.readonly) {
			return true;
		}

		return this.valid && this.totalPercentage === 100;
	}

	public addChild(parentId?: number): void {
		this.activityService
			.getActivityByProductIdAndParentId(this.productId, parentId)
			.pipe(first())
			.subscribe(
				(val) => {
					if (val && val.length > 0) {
						const rootActivity = new Activity(this.activities.length + 1);
						rootActivity.availableActivities = this.getFilteredAvailableActivities(val);
						this.activities.push(rootActivity);
					} else {
						this.showAddBtn = true;
						// check warnings
						this.hasUnderwriterWarning = this.hasWarningForCurrentActivity(this.activityAddForm.controls.percentageInput.value);
					}
				},
				(error) => console.error(JSON.stringify(error)),
				() => this.loaded.emit(true)
			);
	}

	public confirmActivity(isSearchable: boolean): void {
		const activityMaps = new Array<ActivityMap>();

		for (const act of this.activities) {
			const map: ActivityMap = {
				activityMapId: act.activityMapId,
				activityMasterId: act.activityMasterId,
				code: act.code,
				description: act.description,
				productId: 0,
				parentActivityMapId: act.parentActivityMapId,
				numberOfAvailableActivities: act.availableActivities.length,
			};
			activityMaps.push(map);
		}

		let detail: ActivityDetail;
		if (isSearchable || this.isSearchEnabledForAllProducts) {
			detail = {
				percent: this.activityAddForm.controls.percentageInput.value,
				activityMaps: this.selectedActivityTree,
			};
		} else {
			detail = {
				percent: this.activityAddForm.controls.percentageInput.value,
				activityMaps,
			};
		}

		this.vm.activities.push(detail);

		this.excludeActivities(this.activities);

		// emit the event
		if (this.activityAdded) {
			this.activityAdded.emit();
		}

		// Now clear the form for another entry
		this.clearForm();
		this.onChange.emit();
	}

	public onValueChanged(data?: any) {
		if (!this.activityAddForm) {
			return;
		}

		this.valid = true;

		const controls = this.activityAddForm.controls;
		for (const field in controls) {
			if (controls.hasOwnProperty(field)) {
				const control = this.activityAddForm.get(field);

				if (control && !control.valid) {
					this.valid = false;
				}
			}
		}

		// check warnings
		this.hasUnderwriterWarning = this.hasWarningForCurrentActivity(this.activityAddForm.controls.percentageInput.value);
	}

	private hasWarningForCurrentActivity(percent: number): boolean {
		if (this.vm.state >= QuoteState.Approved) {
			return false;
		}

		for (const activity of this.activities) {
			if (percent > this.underwriterActivityValidationService.getMaximumActivityPercentage(activity.code)) {
				return true;
			}
		}
		return false;
	}

	public hasWarningForGivenActivity(activity: ActivityDetail): boolean {
		if (this.vm.state >= QuoteState.Approved) {
			return false;
		}
		return this.underwriterActivityValidationService.doActivityDetailsHaveWarning([activity]);
	}

	public removeActivity(index: number) {
		const removedActivityDetail: ActivityDetail = this.vm.activities.splice(index, 1)[0];
		const lowestActivityIndex = removedActivityDetail.activityMaps.length - 1;
		const lowestActivity = removedActivityDetail.activityMaps[lowestActivityIndex];

		this.releaseActivity(lowestActivity.activityMapId);

		this.clearForm();
		this.onChange.emit();
	}

	private clearForm() {
		this.activities.splice(0, this.activities.length);
		this.showAddBtn = false;
		this.activityAddForm.controls.percentageInput.setValue(this.maxPercentage);
		this.activityAddForm.controls.percentageInput.setValidators([
			Validators.required,
			Validators.min(this.maxPercentage === 0 ? 0 : 1),
			Validators.max(this.maxPercentage),
		]);
		this.activityAddForm.controls.percentageInput.updateValueAndValidity();
		this.addChild(null);
	}

	private excludeActivities(activities: Activity[]): void {
		const activitiesToExclude = this.getActivitiesToExclude(activities);
		this.excludedActivities = this.excludedActivities.concat(activitiesToExclude);
	}

	private getActivitiesToExclude(activities: Activity[]): Activity[] {
		const activitiesToExclude: Activity[] = [];
		let index = activities.length;

		do {
			index--;
			activitiesToExclude.push(activities[index]);
		} while (index > 0 && activities[index].availableActivities.length <= 1);

		return activitiesToExclude;
	}

	private getFilteredAvailableActivities(activities: Activity[]): Activity[] {
		return activities.filter((activity) => !this.excludedActivities.find((excludedActivity) => excludedActivity.activityMapId === activity.activityMapId));
	}

	private releaseActivity(activityMapId: number): void {
		const index = this.excludedActivities.findIndex((activity) => activity.activityMapId === activityMapId);

		if (index > -1) {
			const parentActivityMapId = this.excludedActivities.splice(index, 1)[0].parentActivityMapId;
			if (this.vm.activities) {
				this.vm.activities.forEach((x) => {
					x.activityMaps.forEach((n) => {
						if (n.parentActivityMapId === parentActivityMapId && n.numberOfAvailableActivities <= 2) {
							n.numberOfAvailableActivities++;
						}
					});
				});
			}
			this.releaseActivity(parentActivityMapId);
		}
	}

	private removeActivitiesFromList() {
		let removeActivities: Activity[];
		this.vm.activities.forEach((x) => {
			removeActivities = x.activityMaps.map((p) => {
				return {
					activityMapId: p.activityMapId,
					activityMasterId: p.activityMasterId,
					availableActivities: new Array<Activity>(p.numberOfAvailableActivities),
					parentActivityMapId: p.parentActivityMapId,
					code: p.code,
					description: p.description,
					level: 0,
				} as Activity;
			});
			this.excludeActivities(removeActivities);
		});
	}
}

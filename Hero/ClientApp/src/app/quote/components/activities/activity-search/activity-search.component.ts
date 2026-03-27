import { Component, forwardRef, Inject, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Activity, ActivityMap, DropDownItem } from "@app/models";
import { ActivitySearchResponse } from "@app/quote/components/activities/activity-search/ActivitySearchResponse";
import { ActivityService } from "@app/quote/services/activity.service";
import { QuoteService } from "@app/quote/services/quote.service";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, shareReplay, switchMap, takeUntil, tap } from "rxjs/operators";
import { ActivityListComponent } from "../activity-list/activity-list.component";

@Component({
    selector: "activity-search",
    templateUrl: "activity-search.component.html",
    styleUrls: ["activity-search.component.scss"]
})

export class ActivitySearchComponent implements OnInit, OnDestroy {
    @Input()
    public thisActivity: Activity;

    public activityForm: FormGroup;
    public activityListDropdownItems$: Observable<ActivitySearchResponse[]>;

    private _isLoadingActivities$ = new BehaviorSubject<boolean>(false);
    private ngUnsubscribe = new Subject<void>();

    constructor(
        @Inject(forwardRef(() => ActivityListComponent)) protected listComponent: ActivityListComponent,
        private activityService: ActivityService,
        private formBuilder: FormBuilder,
        private quoteService: QuoteService) {
    }

    ngOnInit(): void {
        this.createForm();
        this.activityListDropdownItems$ = this.getDropDownItems$();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public isLoadingActivities$: Observable<boolean> = this._isLoadingActivities$.asObservable();

    public formatSearchSelectedItem(selectedActivity: ActivitySearchResponse): string {
        return selectedActivity.searchableTerm;
    }

    private createForm() {
        this.activityForm = this.formBuilder.group({
            activity: [""]
        });
    }

    private getDropDownItems$(): Observable<ActivitySearchResponse[]> {
        return this.activityForm.controls.activity.valueChanges.pipe(
            distinctUntilChanged(),
            tap(() => this._isLoadingActivities$.next(true)),
            debounceTime(500),
            switchMap(searchField => {
                if (this.isSelectedActivity(searchField)) {
                    this.setSelectedActivityDetails(searchField);
                    return of(null);
                } else {
                    const quote = this.quoteService.getQuoteReference();
                    const productName = quote.product.productName;

                    if (productName.trim().length > 0 && searchField.trim().length > 0) {
                        return this.activityService.searchByProductCodeAndActivityName(productName, searchField).pipe(takeUntil(this.ngUnsubscribe));
                    } else {
                        return of(null);
                    }
                }
            }),
            tap(() => this._isLoadingActivities$.next(false)),
            shareReplay(1)
        );
    }

    private isSelectedActivity = searchField => typeof searchField === "object"

    private setSelectedActivityDetails(selectedActivity: ActivitySearchResponse): void {
        this.activityService.getActivityByProductCodeAndActivityCode(selectedActivity.activityCode)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((activityMapList: ActivityMap[]) => this.setSelectedActivity(selectedActivity, activityMapList))
            )
            .subscribe();
    }

    private setSelectedActivity(activitySearchResponse: ActivitySearchResponse, activityMapList: ActivityMap[]): void {
        if (activitySearchResponse && activityMapList) {
            const selectedActivity = activityMapList.find(activity => activity.code === activitySearchResponse.activityCode);
            if (selectedActivity) {
                this.thisActivity.activityMapId = selectedActivity.activityMapId;
                this.thisActivity.parentActivityMapId = selectedActivity.parentActivityMapId;
                this.thisActivity.activityMasterId = selectedActivity.activityMasterId;
                this.thisActivity.code = selectedActivity.code;
                this.thisActivity.description = selectedActivity.description;

                this.listComponent.selectedActivityTree = activityMapList;

                this.listComponent.showAddBtn = true;
            }
        } else {
            this.listComponent.showAddBtn = false;
        }
    }

}

import { Component, forwardRef, Inject, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Activity, ActivityMap, DropDownItem } from "@app/models";
import { ActivityListComponent } from "@app/quote/components/activities/activity-list/activity-list.component";
import { Observable, Subscriber } from "rxjs";

@Component({
    selector: "activity-selector",
    templateUrl: "activity-selector.component.html",
    styleUrls: ["activity-selector.component.scss"]
})
export class ActivitySelectorComponent implements OnInit {
    @Input() thisActivity: Activity;

    public activityForm: FormGroup;

    constructor(
        @Inject(forwardRef(() => ActivityListComponent)) protected listComponent: ActivityListComponent,
        private formBuilder: FormBuilder) {
    }

    ngOnInit(): void {
        this.activityForm = this.formBuilder.group({
            selectedValue: [''],
            percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
        });

        this.activityForm.valueChanges.subscribe(data => { this.valueChanged(data) });
    }

    get selectList(): Observable<any> {

        const selectedLeaves = this.getSelectedLeavesActivity();

        const items = this.thisActivity.availableActivities
            .filter(a => !selectedLeaves.some(l => l.code === a.code))
            .map(item => new DropDownItem(item.description, item.activityMapId.toString(), null));

        return Observable.create((observer: Subscriber<any>) => {
            observer.next(items);
            observer.complete();
        });
    }

    valueChanged(data): void {
        if (data.selectedValue.value) {
            const selectedId = parseInt(data.selectedValue.value);
            const selectedActivity = this.thisActivity.availableActivities.find(a => a.activityMapId === selectedId);

            const inserted = (this.thisActivity.activityMapId) ? false : true;
            const changed = (this.thisActivity.activityMapId && this.thisActivity.activityMapId !== selectedActivity.activityMapId);

            this.thisActivity.activityMapId = selectedActivity.activityMapId;
            this.thisActivity.parentActivityMapId = selectedActivity.parentActivityMapId;
            this.thisActivity.activityMasterId = selectedActivity.activityMasterId;
            this.thisActivity.code = selectedActivity.code;
            this.thisActivity.description = selectedActivity.description;

            if (changed) {
                // need to remove all descendants of the old value
                this.listComponent.activities.splice(this.thisActivity.level);
                this.listComponent.showAddBtn = false;
            }
            if (changed || inserted) {
                this.listComponent.addChild(this.thisActivity.activityMapId);
            }
        }
    }

    private getSelectedLeavesActivity(): ActivityMap[] {
        const list = new Array<ActivityMap>();
        if (this.listComponent.vm.activities) {
            for (const map of this.listComponent.vm.activities) {
                if (map && map.activityMaps) {
                    list.push(map.activityMaps[map.activityMaps.length - 1]);
                }
            }
        }
        return list;
    }
}

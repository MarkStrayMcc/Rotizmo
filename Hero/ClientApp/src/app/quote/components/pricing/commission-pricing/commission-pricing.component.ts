import {Component, EventEmitter, Input, OnInit, OnDestroy, Output} from "@angular/core";
import {FormGroup, Validators} from "@angular/forms";
import {Currency, FeatureAccess} from "@app/models";
import {FeaturesHttpService} from "@app/services/features-http.service";
import {Observable, Subject} from "rxjs";
import {takeUntil, tap} from "rxjs/operators";

@Component({
    selector: "commission-pricing",
    templateUrl: "./commission-pricing.component.html",
    styleUrls: ["./commission-pricing.component.scss"]
})
export class CommissionPricing implements OnInit, OnDestroy {
    @Input() public form: FormGroup;
    @Input() public currency: Currency;
    @Input() public productName: string;
    @Input() public readonly: boolean = false;
    @Output() public onUpdateFee: EventEmitter<number> = new EventEmitter<number>();

    protected readonly destroyed$ = new Subject<void>();
    private readonly isBrokerFeeFieldEnabledFeature$: Observable<FeatureAccess | any> = this.featuresHttpService.isFeatureActive("HERO_IsBrokerFeeEnabled");
    private isBrokerFeeFieldEnabledFeature: FeatureAccess;
    private readonly BrokerFeeEnabledProducts: string[] = ["CPM", "CPA", "CMM"];

    constructor(
        private featuresHttpService: FeaturesHttpService
    ) {
    }

    public ngOnInit(): void {
        this.form.controls.originalGrossCommission.setValidators([Validators.required, Validators.max(99)]);
        this.form.controls.actualGrossCommission.setValidators([Validators.required, Validators.max(99)]);
        this.form.controls.cfcShare.setValidators([Validators.required, Validators.max(100)]);
        this.isBrokerFeeFieldEnabledFeature$.pipe(takeUntil(this.destroyed$), tap((feature: FeatureAccess | any) => this.isBrokerFeeFieldEnabledFeature = feature)).subscribe();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public isBrokerFeeFieldEnabled(): boolean {
        return (this.isBrokerFeeFieldEnabledFeature?.hasAccess && this.BrokerFeeEnabledProducts.includes(this.productName))
    }
}

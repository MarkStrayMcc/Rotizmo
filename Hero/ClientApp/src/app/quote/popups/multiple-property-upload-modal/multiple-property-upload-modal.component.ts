import { Component, OnDestroy } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { ToastrService, ToastType } from "@app/shared/toastr/toastr.service";
import { Subject, throwError } from "rxjs";
import { QuoteService } from "@app/quote/services/quote.service";
import { BlastZoneHttpService } from '@app/services/blast-zone-http.service';
import { TemplateUploadResult } from '@app/models/template-upload-result';
import { PropertyLimitBlastZoneCapacityRequest } from "@app/models/property-limit-blast-zone-capacity-request";
import { catchError, takeUntil, tap } from "rxjs/operators";
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { BlastZoneCheckResult } from '@app/models/blast-zone-check-result';
import { InvalidBlastZoneChecks } from '@app/models/invalid-blast-zone-checks';
import { PropertyLimit } from '@app/quote/models/property-limit.model';
import { PropertyLimitFloatingValues } from '@app/quote/models/property-limit-floating-values.model';
import { sumFloatingValues } from '@app/helpers/limit-helper';
import { UserService } from '@app/services/user.service';
import { BinderValidationService } from '@app/services/binder-validation.service';

@Component({
    selector: "app-multiple-property-upload",
    templateUrl: "./multiple-property-upload-modal.component.html",
    styleUrls: ["./multiple-property-upload-modal.component.scss"],
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { displayDefaultIndicatorType: false }
        }
    ]
})
export class MultiplePropertyUploadModal implements OnDestroy {
    private ngUnsubscribe = new Subject<void>();
    firstStepLabel = "Upload Locations";
    uploadResult: TemplateUploadResult | null;
    public binderSectionId: number;
    invalidBlastZoneChecks: InvalidBlastZoneChecks[] = [];
    isLoading = false;
    validBlastZoneCheckResultCount: number = 0;
    propertyLimitFloatingValues: PropertyLimitFloatingValues = new PropertyLimitFloatingValues();
    firstLossLimitValue?: number;
    firstLossLimitChanged: boolean = false;
    floatingValuesChanged: boolean = false;
    private lastCheckedFloatingValuesSum: number = 0;
    hasFirstLossLimitWarning: boolean = false;
    maximumLocationTivValue = 300000000;
    firstLossLimitWarningMessage: string = "";
    uploadedFileName: string | null = null;
    priorSubmitResolved = false;
    hasPerformedInitialBlastZoneCheck = false;

    constructor(
        private readonly dialogRef: MatDialogRef<MultiplePropertyUploadModal>,
        private _toastrService: ToastrService,
        private _quoteService: QuoteService,
        private _blastZoneHttpService: BlastZoneHttpService,
        private _userService: UserService,
        private _binderValidationService: BinderValidationService,
    ) { }

    public closeDialog() {
        this.dialogRef.close();
    }

    public setUploadResult(result: TemplateUploadResult) {
        if (!result) {
            this.uploadResult = null;
            this.propertyLimitFloatingValues = new PropertyLimitFloatingValues();
            this.firstLossLimitValue = undefined;
            this.firstStepLabel = "Upload Locations";
            this.priorSubmitResolved = false;
            this.invalidBlastZoneChecks = [];
            this.validBlastZoneCheckResultCount = 0;
            this.isLoading = false;
            this.firstLossLimitChanged = false;
            this.floatingValuesChanged = false;
            this.lastCheckedFloatingValuesSum = 0;
            this.hasFirstLossLimitWarning = false;
            this.firstLossLimitWarningMessage = "";
            this.hasPerformedInitialBlastZoneCheck = false;
            return;
        }

        if(result?.templateValidationError) {
            this.dialogRef.close()
            this._toastrService.show(result.templateValidationError, ToastType.Error);
            return;
        }

        this.uploadResult = result;
        this.propertyLimitFloatingValues = result?.propertyLimitFloatingValues ?? new PropertyLimitFloatingValues();
        this.firstLossLimitValue = result?.firstLossLimitValue;
        this.firstStepLabel = "Location validation";
        this.priorSubmitResolved = false;
        this.invalidBlastZoneChecks = [];
        this.validBlastZoneCheckResultCount = 0;
        this.isLoading = false;
        this.firstLossLimitChanged = false;
        this.floatingValuesChanged = false;
        this.lastCheckedFloatingValuesSum = sumFloatingValues(this.propertyLimitFloatingValues);
        this.hasFirstLossLimitWarning = false;
        this.firstLossLimitWarningMessage = "";
        this.hasPerformedInitialBlastZoneCheck = false;
    }

    public setUploadedFileName(fileName: string | null) {
        this.uploadedFileName = fileName;
    }

    public get priorSubmitLocations(): PropertyLimit[] {
        return this.uploadResult?.propertyLimits?.filter((limit) => limit.priorCarrierApprovalRequired) ?? [];
    }

    public get hasPriorSubmitStep(): boolean {
        return this.priorSubmitLocations.length > 0;
    }

    public onValidationContinue() {
    }

    public onStepperSelectionChange(event: any) {
        if (event.selectedIndex === 1 && !this.hasPerformedInitialBlastZoneCheck && this.uploadResult?.propertyLimits) {
            this.doBlastZoneCheck();
        }
    }

    public onPriorSubmitResolvedChange(isResolved: boolean) {
        this.priorSubmitResolved = isResolved;
        if (!isResolved) {
            this.clearPriorSubmitApprovals();
        }
    }

    public onPriorSubmitContinue() {
        if (!this.priorSubmitResolved) {
            return;
        }

        this.applyPriorSubmitApprovals();
        this.addLocations();
    }

    public doBlastZoneCheck() {
        if (this.uploadResult?.propertyLimits) {
            const propertyLimitBlastZoneCapacityRequest: PropertyLimitBlastZoneCapacityRequest = this.createPropertyLimitBlastZoneCapacityRequest();
            this.checkBlastZone(propertyLimitBlastZoneCapacityRequest);
        }
    }

    private checkBlastZone(propertyLimitBlastZoneCapacityRequest: PropertyLimitBlastZoneCapacityRequest) {
        this.isLoading = true;
        this._blastZoneHttpService.checkPropertyLimitBlastCapacity(propertyLimitBlastZoneCapacityRequest)
            .pipe(takeUntil(this.ngUnsubscribe),
                tap((blastZoneCheckResult: BlastZoneCheckResult[]) => {
                    this.isLoading = false;
                    this.prepareBlastZone(blastZoneCheckResult);
                }),
                catchError(() => {
                    const errorMessage = 'Blast zone check operation failed!';
                    this._toastrService.show(errorMessage, ToastType.Error);
                    this.isLoading = false;
                    return throwError(errorMessage);
                }))
            .subscribe();
    }

    private prepareBlastZone(blastZoneCheckResult: BlastZoneCheckResult[]) {
        this.hasPerformedInitialBlastZoneCheck = true;
        this.lastCheckedFloatingValuesSum = sumFloatingValues(this.propertyLimitFloatingValues);
        if (blastZoneCheckResult) {
            this.invalidBlastZoneChecks = blastZoneCheckResult
                .filter(x => !x.blastZoneCapacityResult.hasCapacity)
                .map(result => ({ blastZoneCheckResult: result, isPropertyLimitVisible: true }));
            this.validBlastZoneCheckResultCount = blastZoneCheckResult.filter(x => x.blastZoneCapacityResult.hasCapacity)?.length;
        }
    }

    public addLocations() {
        this.uploadResult.propertyLimitFloatingValues = this.propertyLimitFloatingValues;
        this.uploadResult.firstLossLimitValue = this.firstLossLimitValue;
        this.dialogRef.close(this.uploadResult);
        this._toastrService.show('Locations added successfully and capacity available across all locations');
    }

    public checkValidationResults(): boolean {
        if (this.uploadResult?.validationResults && this.uploadResult.validationResults.length > 0) return true;
        return false;
    }

    public isAnyExceededCapacity(): boolean {
        if (this.invalidBlastZoneChecks && this.invalidBlastZoneChecks.length > 0) {
            return true;
        }
        return this.validBlastZoneCheckResultCount > 0 ? false : true;
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public reCheckBlastZone() {
        if (this.firstLossLimitValue > this.maximumLocationTivValue){
            this.hasFirstLossLimitWarning = true;
            this.firstLossLimitWarningMessage = "First Loss Limit Value cannot exceed £300 million";
            return;
        }
        if ((this.firstLossLimitValue == 0 || this.firstLossLimitValue == null) && this.checkExceedingTivValues() == true) {
            this.hasFirstLossLimitWarning = true;
            this.firstLossLimitWarningMessage = "TIV Value cannot exceed £300 million";
            return;
        }
        this.hasFirstLossLimitWarning = false;
        if (this.uploadResult?.propertyLimits && (this.firstLossLimitChanged || this.floatingValuesChanged || this.invalidBlastZoneChecks?.length > 0)) {
            this.firstLossLimitChanged = false;
            this.floatingValuesChanged = false;

            for (let i = 0; i < this.uploadResult.propertyLimits.length; i++) {
                if (this.invalidBlastZoneChecks.some(x => x.blastZoneCheckResult.propertyLimit.ratingReference === this.uploadResult.propertyLimits[i].ratingReference)) {
                    this.uploadResult.propertyLimits[i] = this.invalidBlastZoneChecks.find(x => x.blastZoneCheckResult.propertyLimit.ratingReference === this.uploadResult.propertyLimits[i].ratingReference).blastZoneCheckResult.propertyLimit;
                    this.updateTotalInsuredValue(this.uploadResult.propertyLimits[i]);
                }
            }

            const propertyLimitBlastZoneCapacityRequest: PropertyLimitBlastZoneCapacityRequest = this.createPropertyLimitBlastZoneCapacityRequest();
            this.checkBlastZone(propertyLimitBlastZoneCapacityRequest);
        }
    }

    public onFirstLossLimitChanged(event: number) {
        if(this.firstLossLimitValue === event) return;
        this.firstLossLimitValue = event;
        this.firstLossLimitChanged = true;
    }

    public onFloatingValuesChanged() {
        const currentSum = sumFloatingValues(this.propertyLimitFloatingValues);
        if (currentSum === this.lastCheckedFloatingValuesSum) return;
        this.floatingValuesChanged = true;
    }

    private checkExceedingTivValues(): boolean {
        return this.uploadResult?.propertyLimits.some(x => x.totalInsuredValue > this.maximumLocationTivValue)
    }

    private createPropertyLimitBlastZoneCapacityRequest(): PropertyLimitBlastZoneCapacityRequest {
        const quote = this._quoteService.getQuote();
        return {
            propertyLimits: this.uploadResult.propertyLimits,
            inceptionDate: quote.inceptionDate,
            expiryDate: quote.expiryDate,
            firstLossLimitValue: this.firstLossLimitValue,
            floatingValue: sumFloatingValues(this.propertyLimitFloatingValues),
            originalGroupId: quote.propertyLimits?.length > 0 ? quote.propertyLimits[0].blastZoneReservationId : null,
            binderSectionId: this.binderSectionId ?? this._binderValidationService.getTerrorismBinderSectionId(),
            quoteCurrencyIsoCode: quote.currency?.isoCode,
        };
    }

    private updateTotalInsuredValue(propertyLimit: PropertyLimit) {
        propertyLimit.totalInsuredValue = (propertyLimit.actualLossSustainedLimit ?? 0) +
            (propertyLimit.contentsDamageLimit ?? 0) +
            (propertyLimit.propertyDamageLimit ?? 0) +
            (propertyLimit.increasedCostOfWorkingLimit ?? 0) +
            (propertyLimit.lossOfRentLimit ?? 0) +
            (propertyLimit.alternativeAccommodationLimit ?? 0);
    }

    private applyPriorSubmitApprovals() {
        const approvedBy = this._userService.getUser()?.initials;
        const approvedAt = new Date().toISOString();

        this.priorSubmitLocations.forEach((location) => {
            location.carrierApprovedAt = approvedAt;
            location.carrierApprovedBy = approvedBy;
        });
    }

    private clearPriorSubmitApprovals() {
        this.priorSubmitLocations.forEach((location) => {
            location.carrierApprovedAt = undefined;
            location.carrierApprovedBy = undefined;
        });
    }

    public shouldShowReCheckButton(): boolean {
        return this.hasPerformedInitialBlastZoneCheck && (this.isAnyExceededCapacity() || this.firstLossLimitChanged || this.floatingValuesChanged);
    }
}

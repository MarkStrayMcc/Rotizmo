import { Injectable, OnDestroy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BehaviorSubject, Observable, of, Subject, throwError } from "rxjs";
import { catchError, switchMap, takeUntil } from "rxjs/operators";
import { SurplusLine } from "../models/SurplusLine";
import { SurplusLinesLicense } from "../models/SurplusLinesLicense";
import { SurplusLinesLicenseResult } from "../models/SurplusLinesLicenseResult";
import { SurplusLinesLicenseHttpService } from "./surplus-lines-license-http.service";

@Injectable()
export class SurplusLinesLicenseService implements OnDestroy {
    private ngUnsubscribe = new Subject<void>();
    private _selectedSurplusLine: BehaviorSubject<SurplusLine> = new BehaviorSubject(null);
    private _surplusLinesLicenseList: BehaviorSubject<SurplusLinesLicense[]> = new BehaviorSubject(null);

    public selectedSurplusLine = this._selectedSurplusLine.asObservable();
    public surplusLinesLicenseList = this._surplusLinesLicenseList.asObservable();

    constructor(private surplusLinesLicenseHttpService: SurplusLinesLicenseHttpService) { }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public getSurplusLinesByBrokerTeamIdAndStateIsoCode(brokerId: number, state: string): Observable<SurplusLine[] | any> {
        return this.surplusLinesLicenseHttpService.getSurplusLinesByBrokerTeamIdAndStateIsoCode(brokerId, state)
            .pipe(takeUntil(this.ngUnsubscribe),
                catchError((response: Response | any) => {
                    return throwError(response);
                }));
    }

    public saveSurplusLinesLicense(surplusLinesLicenseForm: FormGroup): Observable<SurplusLinesLicense | any> {
        const surplusLinesLicenseRequest = this.mapSurplusLineRequest(surplusLinesLicenseForm);
        return this.surplusLinesLicenseHttpService.saveSurplusLinesLicense(surplusLinesLicenseRequest)
            .pipe(takeUntil(this.ngUnsubscribe),
                switchMap((surplusLinesLicenseResult: SurplusLinesLicenseResult) =>
                    of(this.mapSurplusLineResponse(surplusLinesLicenseResult.surplusLinesLicenseId, surplusLinesLicenseRequest.surplusLinesLicense))),
                catchError((response: Response | any) => {
                    return throwError(response);
                }));
    }

    public mapSurplusLinesLicenseToSuplusLine(surplusLinesLicense: SurplusLinesLicense): SurplusLine {
        let surplusLine = new SurplusLine();
        surplusLine.address1 = surplusLinesLicense.address1;
        surplusLine.address2 = surplusLinesLicense.address2;
        surplusLine.address3 = surplusLinesLicense.address3;
        surplusLine.brokerName = surplusLinesLicense.brokerName;
        surplusLine.contactName = surplusLinesLicense.contactName;
        surplusLine.expiryDate = surplusLinesLicense.expiryDate;
        surplusLine.id = surplusLinesLicense.id;
        surplusLine.licenseNumber = surplusLinesLicense.licenseNumber;
        surplusLine.stateProvinceCode = surplusLinesLicense.stateProvinceIsoCode;
        surplusLine.surplusLineBrokerUid = surplusLinesLicense.surplusLinesLicenseUid;
        surplusLine.zip = surplusLinesLicense.zipCode;
        return surplusLine;
    }

    public mapSurplusLinesLicenseListToSuplusLineList(surplusLinesLicenses: SurplusLinesLicense[]): SurplusLine[] {
        let surplusLineList: SurplusLine[] = [];
        surplusLinesLicenses.map(surplusLinesLicense => {
            let surplusLine = new SurplusLine();
            surplusLine.address1 = surplusLinesLicense.address1;
            surplusLine.address2 = surplusLinesLicense.address2;
            surplusLine.address3 = surplusLinesLicense.address3;
            surplusLine.brokerName = surplusLinesLicense.brokerName;
            surplusLine.contactName = surplusLinesLicense.contactName;
            surplusLine.expiryDate = surplusLinesLicense.expiryDate;
            surplusLine.id = surplusLinesLicense.id;
            surplusLine.licenseNumber = surplusLinesLicense.licenseNumber;
            surplusLine.stateProvinceCode = surplusLinesLicense.stateProvinceIsoCode;
            surplusLine.surplusLineBrokerUid = surplusLinesLicense.surplusLinesLicenseUid;
            surplusLine.zip = surplusLinesLicense.zipCode;
            surplusLineList.push(surplusLine);
        });
        return surplusLineList;
    }

    private mapSurplusLineRequest(form: FormGroup) {
        const surplusLinesLicense = new SurplusLinesLicense();

        surplusLinesLicense.contactName = form.get("name").value;
        surplusLinesLicense.brokerName = form.get("company").value;
        surplusLinesLicense.licenseNumber = form.get("licence").value;
        surplusLinesLicense.expiryDate = form.get("expiry").value;
        surplusLinesLicense.address1 = form.get("address1").value;
        surplusLinesLicense.address2 = form.get("address2").value;
        surplusLinesLicense.address3 = form.get("address3").value;
        surplusLinesLicense.stateProvinceIsoCode = form.get("state").value.value;
        surplusLinesLicense.licenseStateIsoCode = form.get("licenceState").value.value;
        surplusLinesLicense.zipCode = form.get("zip").value;

        const surplusLinesLicenseRequest = { surplusLinesLicense: surplusLinesLicense }

        return surplusLinesLicenseRequest;
    }

    private mapSurplusLineResponse(surplusLinesLicenseId: number, surplusLinesLicense: SurplusLinesLicense): SurplusLinesLicense {
        if (!surplusLinesLicenseId || surplusLinesLicenseId === 0) {
            return;
        }
        surplusLinesLicense.id = surplusLinesLicenseId;
        return surplusLinesLicense;
    }
}

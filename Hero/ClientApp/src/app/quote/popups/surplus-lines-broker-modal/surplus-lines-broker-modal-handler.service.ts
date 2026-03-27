import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MessageType } from "@app/enums/MessageType";
import { Message, SurplusLine } from "@app/models";
import { SurplusLinesLicenseHttpService } from "@app/quote/services/surplus-lines-license-http.service";
import { MessageService } from "@app/services/message.service";

import { Observable, Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class SurplusLinesBrokerModalHandler {

    constructor(
        private readonly surplusLineHttpService: SurplusLinesLicenseHttpService,
        private readonly messageService: MessageService) {
    }    

    public save(form: FormGroup): Observable<SurplusLine> {
        const surplusLine = this.getSurplusLineFromForm(form);

        return this.addNewSurplusLine(surplusLine);
    }

    private getSurplusLineFromForm(form: FormGroup): SurplusLine {
        const surplusLine = new SurplusLine();

        surplusLine.contactName = form.controls.name.value;
        surplusLine.brokerName = form.controls.company.value;
        surplusLine.licenseNumber = form.controls.licence.value;
        surplusLine.expiryDate = form.controls.expiry.value;
        surplusLine.address1 = form.controls.address1.value;
        surplusLine.address2 = form.controls.address2.value;
        surplusLine.address3 = form.controls.address3.value;
        surplusLine.stateProvinceCode = form.controls.state.value.value;
        surplusLine.zip = form.controls.zip.value;

        return surplusLine;
    }

    private addNewSurplusLine(surplusLine: SurplusLine): Observable<SurplusLine> {
        this.messageService.clearMessage();

        const subject$ = new Subject<SurplusLine>();

        this.surplusLineHttpService.saveSurplusLine(surplusLine)
            .subscribe(
                surplusLineId => this.onSaveNext(surplusLine, surplusLineId, subject$),
                error => this.onSaveError(error, subject$),
                () => subject$.complete());

        return subject$;
    }

    private onSaveNext(surplusLine: SurplusLine, surplusLineId: number, subject$: Subject<SurplusLine>): void {
        surplusLine.id = surplusLineId;

        subject$.next(surplusLine);
    }

    private onSaveError(error: any, subject$: Subject<SurplusLine>): void {
        const message = new Message("Failed to save new surplus lines broker", MessageType.Error);

        subject$.error(error);

        this.messageService.sendMessage(message);
    }
}

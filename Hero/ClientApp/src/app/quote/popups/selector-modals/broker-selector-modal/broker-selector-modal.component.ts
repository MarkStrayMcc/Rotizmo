import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { CfcContact } from "@app/models";
import { EnquirySearchResponse } from "@app/models/auto-generated/EnquirySearchResponse";
import { EnquirySearchResult } from "@app/models/auto-generated/EnquirySearchResult";
import { EnquiryHttpService } from "@app/services/enquiry-http-service";
import { UserService } from "@app/services/user.service";

@Component({
    selector: "broker-selector-modal",
    templateUrl: "broker-selector-modal.component.html",
    styleUrls: ["broker-selector-modal.component.scss"]
})

export class BrokerSelectorModalComponent implements OnInit, OnDestroy {
    public modalTitle: string = "Please select Broker";
    public isLoadingBrokerOptions: boolean = true;
    public brokersList: EnquirySearchResult[];
    public clientId: number;
    public userProfile: CfcContact;
    public isLoadingBrokerList: boolean = false;
    public brokerSelectionForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<BrokerSelectorModalComponent>,
        public enquiryService: EnquiryHttpService,
        private userService: UserService) {
    }

    public ngOnInit() {
        this.userService.getData().subscribe(user => this.userProfile = user);
        this.setBrokersList();
        this.createBrokerForm();
    }

    public ngOnDestroy() { }

    private createBrokerForm() {
        const group = this.fb.group({});
        const formControl = new FormControl(null, Validators.required);
        group.addControl("broker", formControl);
        this.brokerSelectionForm = group;
    }

    public setBrokersList() {
        this.isLoadingBrokerList = true;
        //We populate the list of brokers based on those that have open enquiries for the client
        this.enquiryService.enquiriesSearch(this.clientId, this.userProfile.cfcTeamName)
            .subscribe((enquiriesList: EnquirySearchResponse) => {
                this.brokersList = enquiriesList.results;
                this.isLoadingBrokerList = false;
            });
    }

    public onSaveBroker() {
        this.dialogRef.close(this.brokerSelectionForm.get("broker").value);
    }

    public isValidForm() {
        return this.brokerSelectionForm.status === 'VALID';
    }
}

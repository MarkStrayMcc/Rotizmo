import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
    CfcContact,
    CfcContactPersonalMessage,
    CfcContactPersonalMessageChangeRequest,
    CfcContactPersonalMessageStatus
} from "@app/models";
import { CfcContactPersonalMessageHttpService } from "@app/services/cfc-contact-personal-message-http.service";
import { Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Component({
    selector: "user-profile",
    templateUrl: "./user-profile.component.html",
    styleUrls: ["./user-profile.component.scss"]
})

export class UserProfileComponent implements OnInit, OnChanges {
    @Input() public contact: CfcContact;

    public personalMessage: CfcContactPersonalMessage;
    public form: FormGroup;

    private serviceSubscription: Subscription;
    private inputSubscription: Subscription;
    private isInitialized: boolean = false;

    constructor(
        private personalMessageHttpService: CfcContactPersonalMessageHttpService,
        private fb: FormBuilder
    ) {
        this.createForm();
    }

    public ngOnInit(): void {
        if (this.contact) {
            this.setupSubscriptions();
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (this.isInitialized) return;

        if (changes.contact) {
            const contact = changes.contact.currentValue as CfcContact;
            if (contact && contact.cfcContactId > 0) {
                // TODO: this should be wired with proper event handling from the contact service
                // but we need this hack due to the way the contact id is wired to everything.
                // if contact Id is finally > 0 , that means the app was initialized
                this.isInitialized = true;

                this.closeSubscriptions();
                this.setupSubscriptions();
            }
        }
    }

    public ngOnDestroy() {
        this.closeSubscriptions();
    }

    public get backgroundImageString() {
        if (!this.contact) {
            return "";
        }

        return "url('" + this.contact.profileImageUrl + "')";
    }

    public get isApproved(): boolean {
        return this.personalMessage
            && (this.personalMessage.cfcContactPersonalMessageStatus === CfcContactPersonalMessageStatus.approved
                || this.personalMessage.cfcContactPersonalMessageStatus === CfcContactPersonalMessageStatus.autoApproved);
    }

    private setupSubscriptions() {
        this.serviceSubscription = this.personalMessageHttpService.getPersonalMessageById(this.contact.cfcContactId)
            .subscribe((message: CfcContactPersonalMessage) => {
                this.personalMessage = message;
                this.form.setValue({ message: message.personalMessage });
            });

        const input = this.form.get("message");
        this.inputSubscription = input.valueChanges
            .pipe(
                debounceTime(2500),
                distinctUntilChanged())
            .subscribe(changedValue => {
                if (this.form.valid && this.contact && this.contact.cfcContactId > 0) {
                    if (changedValue === this.personalMessage.personalMessage) return;

                    const changeRequest = new CfcContactPersonalMessageChangeRequest();
                    changeRequest.cfcContactId = this.contact.cfcContactId;
                    changeRequest.personalMessage = changedValue;

                    this.personalMessageHttpService.setPersonalMessage(changeRequest).subscribe(
                        (updatedMessage: CfcContactPersonalMessage) => {
                            this.personalMessage = updatedMessage;
                        }
                    );
                }
            });
    }

    private closeSubscriptions() {
        if (this.serviceSubscription) {
            this.serviceSubscription.unsubscribe();
        }
        if (this.inputSubscription) {
            this.inputSubscription.unsubscribe();
        }
    }

    private createForm(): void {
        this.form = this.fb.group({
            message: ["", Validators.maxLength(40)]
        });
    }
}

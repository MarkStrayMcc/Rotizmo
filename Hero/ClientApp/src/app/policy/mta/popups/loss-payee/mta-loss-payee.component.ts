import { Component, ElementRef, ViewChild } from "@angular/core";
import { Validators, FormControl } from "@angular/forms";
import { MessageType } from "@app/enums";
import { LossPayeeMtaRequest } from "@app/models/auto-generated/LossPayeeMtaRequest";
import { Message } from "@app/models/Message";
import { MtaService } from "@app/policy/services/mta.service";
import { DropdownService } from "@app/services/dropdown.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { Guid } from "guid-typescript";
import * as moment from "moment";
import { MtaModalModel } from "../mta-modal.model";
import { MtaSendEmailModalConfig } from "../send-email/mta-send-email-modal.config";
import { MtaSendEmailComponent } from "../send-email/mta-send-email.component";
import { MtaSendEmailModel } from "../send-email/mta-send-email.model";
import { FormGroup, FormBuilder } from "@angular/forms";
import { PolicyLossPayeeService } from "@app/policy/services/policy-loss-payee.service";
import { LossPayeeComponent } from "@app/shared/loss-payee/loss-payee.component";
import { LossPayeeConfigBuilder } from "@app/shared/loss-payee/loss-payee.config-builder";
import { ILossPayeeDetails } from "@app/shared/loss-payee/ILossPayeeDetails";
import { catchError, finalize, tap } from "rxjs/operators";
import { EMPTY, Observable } from "rxjs";

@Component({
	selector: "policy-mta-loss-payee-modal",
	styleUrls: ["mta-loss-payee.component.scss"],
	templateUrl: "mta-loss-payee.component.html",
})
export class MtaLossPayeeComponent extends LossPayeeComponent {
	public isSaving = false;
	public isSending = false;
	public isSendDisabled = true;
	public dialogModel: MtaModalModel;
	public mtaId: Guid;
	public effectiveDateForm: FormGroup;

	protected sendEmailModalModel: MtaSendEmailModel;

	@ViewChild("formComponent") formComponent: ElementRef;

	constructor(
		public mtaHttpService: MtaService,
		public userService: UserService,
		public formCreatorService: FormCreatorService,
		public dropdownService: DropdownService,
		public lossPayeeConfigBuilder: LossPayeeConfigBuilder,
		private messageService: MessageService,
		private formBuilder: FormBuilder,
		private policyLossPayeeService: PolicyLossPayeeService,
		private modalDialogService: ModalDialogService
	) {
		super(userService, formCreatorService, dropdownService, lossPayeeConfigBuilder);
	}

	public ngOnInit() {
		super.ngOnInit();
		this.getExistingLossPayees();

		const group = this.formBuilder.group({});
		const formControl = new FormControl(moment(this.dialogModel.policy.inceptionDate), [Validators.required]);
		group.addControl("effectiveDate", formControl);
		this.effectiveDateForm = group;
	}

	public save() {
		this.messageService.clearAllMessages();
		this.savingLossPayee();
		const lossPayeeRequest: LossPayeeMtaRequest = this.mtaLossPayeeRequestBuilder();

		this.mtaHttpService
			.postLossPayeeMta(lossPayeeRequest, this.dialogModel.policy.reference)
			.pipe(
				tap((response) => {
					this.mtaId = Guid.parse(response.mtaId);
					this.lossPayeeFormSaved();
				}),
				catchError((error) => this.handleCancelError(error))
			)
			.subscribe();
	}

	private handleCancelError(error: { error: { validationMessages: string[] } }): Observable<never> {
		this.messageService.sendMessage({
			text: "An error occurred while submitting your change. Please contact IT Support.",
			type: MessageType.Error,
			messageList: error?.error?.validationMessages,
		});

		this.lossPayeeFormErrorOnSaving();

		return EMPTY;
	}

	public openSendEmailModal() {
		this.formCreatorService.setForm(null);
		this.formCreatorService.setButtonClicked(null);
		this.sendEmailModalModel = {
			mtaId: this.mtaId,
			policy: this.dialogModel.policy,
		};
		this.modalDialogService.openDialog<MtaSendEmailComponent, MtaSendEmailModel>(
			MtaSendEmailComponent,
			MtaSendEmailModalConfig.dialog.matDialogConfig,
			(modalConfig) => {
				modalConfig.user = this.userProfile;
				modalConfig.dialogModel = this.sendEmailModalModel;
				modalConfig.readOnly = false;
			},
			(result: any) => this.onCloseClientSendEmailDialog(result)
		);
	}

	private onCloseClientSendEmailDialog(result: any) {
		setTimeout(() => {
			this.sendEmailModalModel = result;
			this.lossPayeeFormSaved();
			this.formHandler();
		});
	}

	private getExistingLossPayees() {
		this.policyLossPayeeService.getLossPayees(this.dialogModel.policy.reference).subscribe(
			(lossPayees) => {
				if (lossPayees) {
					lossPayees.map((lossPayee) => {
						let lossPayeeDetails: ILossPayeeDetails = { lossPayee: lossPayee, isVisible: false, id: Guid.create() };
						this.lossPayeeDetails.push(lossPayeeDetails);
					});
				} else {
					this.handleError();
				}
			},
			(exception) => {
				if (exception.error && exception.error.validationMessages && exception.error.validationMessages.length > 0) {
					this.handleError(exception.error.validationMessages);
				} else {
					this.handleError();
				}
			}
		);
	}

	private savingLossPayee() {
		this.isSaving = true;
		this.disableAddButton();
		this.isSaveDisabled = true;
	}

	private lossPayeeFormSaved() {
		this.isSaving = false;
		this.isSaved = true;
		this.isSendDisabled = false;
		this.isSaveDisabled = true;
	}

	private lossPayeeFormErrorOnSaving() {
		this.isSaving = false;
		this.isSaveDisabled = false;
		this.isSendDisabled = true;
	}

	private mtaLossPayeeRequestBuilder(): LossPayeeMtaRequest {
		let lossPayeeMtaRequest = {
			lossPayees: this.lossPayeeDetails.map((list) => list.lossPayee),
			cfcUserId: this.userProfile.cfcContactUid,
			effectiveDate: this.effectiveDateForm.controls.effectiveDate.value.toDate(),
		} as LossPayeeMtaRequest;

		return lossPayeeMtaRequest;
	}

	private handleError(errorList: string[] = null) {
		const message = new Message();
		message.type = MessageType.Error;

		if (errorList != null && errorList.length === 1) {
			message.text = errorList[0];
		} else if (errorList != null && errorList.length > 1) {
			message.messageList = errorList;
		} else {
			message.text = "An error occurred while submitting your change. Please contact IT Support.";
		}

		this.messageService.sendMessage(message);
	}
}

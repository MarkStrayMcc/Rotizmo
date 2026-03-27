import { ComponentType } from "@angular/cdk/portal";
import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DBOperation } from "@app/enums/DBOperations";
import { DocumentPreviewType } from "@app/interfaces/DocumentPreviewType";
import { Policy } from "@app/models/auto-generated/Policy";
import { Quote } from "@app/models/auto-generated/Quote";
import { DocumentPreviewTypes } from "@app/models/document-preview-types";
import { MtaLossPayeeModalConfig } from "@app/policy/mta/popups/loss-payee/mta-loss-payee-modal.config";
import { MtaLossPayeeComponent } from "@app/policy/mta/popups/loss-payee/mta-loss-payee.component";
import { ConfigService } from "@app/services/config.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { PreviewDocumentModalService } from "@app/services/preview-document-modal.service";
import { UserService } from "@app/services/user.service";
import { MtaSelectionType } from "./mta/mta-selection.config";
import { MtaAdditionalInsuredModalConfig } from './mta/popups/additional-insured/mta-additional-insured-modal.config';
import { MtaAdditionalInsuredComponent } from './mta/popups/additional-insured/mta-additional-insured.component';
import { MtaAddressChangeModalConfig } from "./mta/popups/address-change/mta-address-change-modal.config";
import { MtaAddressChangeComponent } from "./mta/popups/address-change/mta-address-change.component";
import { MtaAbInitioCancellationComponent } from "./mta/popups/mta-ab-initio-cancellation/mta-ab-initio-cancellation.component";
import { MtaNameChangeModalConfig } from "./mta/popups/client-name-change/mta-client-name-change-modal.config";
import { MtaClientNameChangeComponent } from "./mta/popups/client-name-change/mta-client-name-change.component";
import { MtaManualChangeMtaConfig } from "./mta/popups/manual-mta/mta-manual-mta-modal.config";
import { MtaManualChangeMtaComponent } from "./mta/popups/manual-mta/mta-manual-mta.component";
import { MtaModalModel } from "./mta/popups/mta-modal.model";
import { MtaCancellationComponent } from "./mta/popups/cancellation/cancellation.component";
import { MtaCancellationModalConfig } from "./mta/popups/cancellation/cancellation-modal.config";

@Component({
    selector: "policy-item",
    templateUrl: "./policy-item.component.html",
    styleUrls: ["./policy-item.component.scss"]
})

export class PolicyItemComponent implements OnInit {
    @Input()
    public policy: Policy;

    @Input()
    public mtaSelectionTypes: MtaSelectionType[];
    public previewTypes = new DocumentPreviewTypes();

    private _readonly: boolean = false;
    private _modalModel: MtaModalModel = new MtaModalModel();

    constructor(
        public modalDialogService: ModalDialogService,
        public router: Router,
        public userService: UserService,
        private navigationOverrideService: NavigationOverrideService,
        private previewDocumentModalService: PreviewDocumentModalService,
        private configService: ConfigService) {
    }

    ngOnInit() { }

    public getPolicyDownloadUrl() {
        return `document/pdf/policy/${this.policy.reference}`;
    }

    public allowNavigation() {
        this.navigationOverrideService.allowNavigation = true;
    }

    public policyIsCancelled() {
        return new Date(this.policy.expirationDate) < new Date();
    }

    public mtaTypeClicked(policyAndMta: any) {
        this.startMtaCreation(policyAndMta);
    }

    private startMtaCreation(policyAndMta: any) {
        let isHeroPolicy = policyAndMta.policy.nerdVersion === 3;
        if (isHeroPolicy) {
            this.openMtaModal(policyAndMta.policy, policyAndMta.mtaType);
        } else {
            this.router.navigate(["/nerdMidTermAdjustments",
                {
                    externalUrl: this.getNerdMtaUrl(policyAndMta.policy.reference, policyAndMta.mtaType),
                }
            ]);
        }
    }

    private openMtaModal(policy: Policy, mtaType: string) {
        switch (mtaType) {
            case "Address Change":
                this.openAddressChangeModal(policy);
                break;
            case "Name Change":
                this.openNameChangeModal(policy);
                break;
            case "Additional Insured":
                this.openAdditionalInsuredModal(policy);
                break;
            case "Loss Payee":
                this.openLossPayeeModal(policy);
                break;
            case "Cancellation":
                this.openCancellationModal(policy);
                break;
            case "Register Manual MTA":
                this.openManualMtaModal(policy);
                break;
        }
    }

    private openAddressChangeModal(policy: Policy) {
        this._modalModel = new MtaModalModel();
        this.modalDialogService.openDialog<MtaAddressChangeComponent, MtaModalModel>
            (MtaAddressChangeComponent, MtaAddressChangeModalConfig.dialog.matDialogConfig,
                modalConfig => {
                    this._modalModel.dbOperation = DBOperation.create;
                    this._modalModel.modalBtnTitle = "Save";
                    this._modalModel.policy = policy;
                    modalConfig.dialogModel = this._modalModel;
                    modalConfig.readonly = this._readonly;
                },
                (result: any) => this.onCloseClientAddressDialog(result)
            );
    }

    private onCloseClientAddressDialog(result: any) {
        setTimeout(() => {
            this._modalModel = result;
        });
    }

    private openAdditionalInsuredModal(policy: Policy) {
        this._modalModel = new MtaModalModel();
        this.modalDialogService.openDialog<MtaAdditionalInsuredComponent, MtaModalModel>
            (MtaAdditionalInsuredComponent, MtaAdditionalInsuredModalConfig.dialog.matDialogConfig,
                modalConfig => {
                    this._modalModel.dbOperation = DBOperation.create;
                    this._modalModel.modalBtnTitle = "Save";
                    this._modalModel.policy = policy;
                    modalConfig.dialogModel = this._modalModel;
                    modalConfig.readonly = this._readonly;
                },
                (result: any) => this.onCloseAdditionalInsuredDialog(result)
            );
    }

    private onCloseAdditionalInsuredDialog(result: any) {
        setTimeout(() => {
            this._modalModel = result;
        });
    }

    private openLossPayeeModal(policy: Policy) {
        this._modalModel = new MtaModalModel();
        this.modalDialogService.openDialog<MtaLossPayeeComponent, MtaModalModel>
            (MtaLossPayeeComponent, MtaLossPayeeModalConfig.dialog.matDialogConfig,
                modalConfig => {
                    this._modalModel.dbOperation = DBOperation.create;
                    this._modalModel.modalBtnTitle = "Save";
                    this._modalModel.policy = policy;
                    modalConfig.dialogModel = this._modalModel;
                    modalConfig.readonly = this._readonly;
                },
                (result: any) => this.onCloseLossPayeeDialog(result)
            );
    }

    private onCloseLossPayeeDialog(result: any) {
        setTimeout(() => {
            this._modalModel = result;
        });
    }

    private openCancellationModal(policy: Policy) {
        const modalComponentType: ComponentType<any> = this.userService.isFeatureAccessible("heroCancellationMtaV2") ?
            MtaCancellationComponent : 
            MtaAbInitioCancellationComponent;

        this._modalModel = new MtaModalModel();
        this.modalDialogService.openDialog<typeof modalComponentType, MtaModalModel>
            (modalComponentType, MtaCancellationModalConfig.dialog.matDialogConfig,
                modalConfig => {
                    this._modalModel.dbOperation = DBOperation.create;
                    this._modalModel.modalBtnTitle = "Save";
                    this._modalModel.policy = policy;
                    modalConfig.dialogModel = this._modalModel;
                    modalConfig.readonly = this._readonly;
                },
                (result: any) => this.onCloseCancellationDialog(result)
            );
    }

    private onCloseCancellationDialog(result: any) {
        setTimeout(() => {
            this._modalModel = result;
        });
    }

    private openManualMtaModal(policy: Policy) {
        this._modalModel = new MtaModalModel();
        this.modalDialogService.openDialog<MtaManualChangeMtaComponent, MtaModalModel>
            (MtaManualChangeMtaComponent, MtaManualChangeMtaConfig.dialog.matDialogConfig,
                modalConfig => {
                    this._modalModel.dbOperation = DBOperation.create;
                    this._modalModel.modalBtnTitle = "Save";
                    this._modalModel.policy = policy;
                    modalConfig.dialogModel = this._modalModel;
                    modalConfig.readonly = this._readonly;
                },
                (result: any) => this.onCloseManualMtaDialog(result)
            );
    }

    private onCloseManualMtaDialog(result: any) {
        setTimeout(() => {
            this._modalModel = result;
        });
    }

    private openNameChangeModal(policy: Policy) {
        this._modalModel = new MtaModalModel();
        this.modalDialogService.openDialog<MtaClientNameChangeComponent, MtaModalModel>
            (MtaClientNameChangeComponent, MtaNameChangeModalConfig.dialog.matDialogConfig,
                modalConfig => {
                    this._modalModel.dbOperation = DBOperation.create;
                    this._modalModel.modalBtnTitle = "Save";
                    this._modalModel.policy = policy;
                    modalConfig.dialogModel = this._modalModel;
                    modalConfig.readonly = this._readonly;
                },
                (result: any) => this.onCloseNameChangeDialog(result)
            );
    }

    private onCloseNameChangeDialog(result: any) {
        setTimeout(() => {
            this._modalModel = result;
        });
    }

    private getNerdMtaUrl(policyReference: string, mtaType: string): string {
        return this.configService.nerdUrl + "/MidTermAdjustments.aspx" + "?policy=" + policyReference + "&mtaType=" + mtaType;
    }

    public openPreviewDocumentDialog(previewType: DocumentPreviewType) {
        const quote = new Quote;
        quote.policyNumber = this.policy.reference;
        this.previewDocumentModalService.openPreviewDocumentDialog(previewType, quote);
    }
}

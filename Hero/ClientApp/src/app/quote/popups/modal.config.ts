import { MatDialogConfig } from "@angular/material/dialog";

// tslint:disable:max-classes-per-file
class MatDialogExtension {
	public matDialogConfig: MatDialogConfig;
	public maxHeight: number;
	public maxWeight: number;
	public increaseStep: number;
	public startStep: number;
}

export class ModalConfig {
	public static underwriterModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalUnderwriterNotes",
			height: null,
			width: "1000px",
			position: {
				top: "30px",
			},
			disableClose: false,
		},
		maxHeight: null,
		maxWeight: 812,
		increaseStep: 120,
		startStep: 300,
	};

	public static surplusLinesBrokerModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalSurplusLinesBroker",
			height: null,
			width: "600px",
			position: {
				top: "30px",
			},
		},
		maxHeight: null,
		maxWeight: 600,
		increaseStep: null,
		startStep: null,
	};

	public static clientAddressModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalClientAddress",
			height: null,
			width: "1000px",
			disableClose: false,
			hasBackdrop: true,
			position: {
				top: "30px",
			},
		},
		maxHeight: null,
		maxWeight: 1000,
		increaseStep: 325,
		startStep: 200,
	};

	public static clientManageAddressModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalClientManageAddress",
			height: "600px",
			width: "600px",
			disableClose: false,
			hasBackdrop: true,
		},
		maxHeight: 1000,
		maxWeight: 600,
		increaseStep: 45,
		startStep: 612,
	};

	public static clientAddressMap: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalClientAddressMap",
			height: "550px",
			width: "1000px",
			data: 0,
			disableClose: false,
			hasBackdrop: true,
		},
		maxHeight: 550,
		maxWeight: 1000,
		increaseStep: 0,
		startStep: 0,
	};

	public static sendQuoteModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalSendQuote",
			height: null,
			width: "1000px",
			position: {
				top: "30px",
			},
			disableClose: true,
		},
		maxHeight: 1205,
		maxWeight: 1000,
		increaseStep: 110,
		startStep: 700,
	};

	public static bindQuoteModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalBindQuote",
			height: null,
			width: "600px",
			position: {
				top: "30px",
			},
			disableClose: true,
		},
		maxHeight: null,
		maxWeight: 600,
		increaseStep: null,
		startStep: null,
	};

	public static publishQuoteModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalPublishQuote",
			height: null,
			width: "650px",
			position: {
				top: "30px",
			},
			disableClose: false,
		},
		maxHeight: null,
		maxWeight: 650,
		increaseStep: null,
		startStep: null,
	};

	public static underwriterReferralSelectorModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalUnderwriterReferralSelector",
			hasBackdrop: true,
			height: null,
			width: "680px",
		},
		maxHeight: null,
		maxWeight: null,
		increaseStep: null,
		startStep: null,
	};

	public static addTransactionModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalAddTransaction",
			width: "800px",
			disableClose: true,
		},
		maxHeight: 750,
		maxWeight: 600,
		increaseStep: null,
		startStep: null,
	};

	public static addEcfReconciliationModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalAddEcfReconciliation",
			height: null,
			width: "440px",
			disableClose: true,
		},
		maxHeight: null,
		maxWeight: 600,
		increaseStep: null,
		startStep: null,
	};

	public static changeStatusModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalChangeStatus",
			height: null,
			width: "800px",
			disableClose: false,
		},
		maxHeight: null,
		maxWeight: 600,
		increaseStep: null,
		startStep: null,
	};

	public static previewDocumentModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "previewDocumentModal",
			height: null,
			width: "60vw",
			position: {
				top: "30px",
			},
			disableClose: false,
		},
		maxHeight: null,
		maxWeight: 1200,
		increaseStep: 10100,
		startStep: 300,
	};

	public static bespokeClauseModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "bespokeClauseModal",
			height: null,
			width: "600px",
			position: {
				top: "30px",
			},
			disableClose: false,
		},
		maxHeight: null,
		maxWeight: 600,
		increaseStep: null,
		startStep: null,
	};

	public static transferToOfficeModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "transferToOfficeModal",
			height: null,
			width: null,
			disableClose: false,
		},
		maxHeight: null,
		maxWeight: 600,
		increaseStep: null,
		startStep: null,
	};

	public static deleteOutstandingFundModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "deleteOutstandingFundModal",
			height: null,
			width: null,
			disableClose: false,
		},
		maxHeight: null,
		maxWeight: 600,
		increaseStep: null,
		startStep: null,
	};

	public static quoteAdditionalInsuredModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalQuoteAdditionalInsured",
			height: "auto",
			width: "900px",
			disableClose: false,
			hasBackdrop: true,
		},
		maxHeight: 1000,
		maxWeight: 590,
		increaseStep: 45,
		startStep: 612,
	};

	public static multiplePropertyModal: MatDialogExtension = {
		matDialogConfig: {
			height: "auto",
			width: "900px",
			disableClose: false,
			hasBackdrop: true,
		},
		maxHeight: 1000,
		maxWeight: 590,
		increaseStep: 45,
		startStep: 612,
	};

	public static quoteLossPayeeModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalQuoteLossPayee",
			height: "auto",
			width: "900px",
			disableClose: false,
			hasBackdrop: true,
		},
		maxHeight: 1000,
		maxWeight: 590,
		increaseStep: 45,
		startStep: 612,
	};

	public static multiplePropertyUploadModal: MatDialogExtension = {
		matDialogConfig: {
			panelClass: "modalMultiplePropertyUpload",
			height: "auto",
			width: "1000px",
			disableClose: false,
			hasBackdrop: true,
            minHeight: 300
		},
		maxHeight: 900,
		maxWeight: null,
		increaseStep: null,
		startStep: null,
	};
}

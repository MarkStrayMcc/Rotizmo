import { TransferToOfficeFormattedResponseMessage } from "@app/services/finance/transfer-to-office-modal/models/TransferToOfficeResponseMessage";
import { MultipleOperationsResultProblemDetails, OutstandingFundsTransferResponse } from "@app/models";


export class TransferToOfficeResponseMessageRetriever {
    public getResponseMessage(
        transferToOfficeResponse: MultipleOperationsResultProblemDetails | OutstandingFundsTransferResponse
    ): TransferToOfficeFormattedResponseMessage {
        const transerToOfficeFormattedMessage = new TransferToOfficeFormattedResponseMessage();
        if ((transferToOfficeResponse.hasOwnProperty("failures"))) {
            const failureReponse = transferToOfficeResponse as MultipleOperationsResultProblemDetails;
            transerToOfficeFormattedMessage.statusCode = failureReponse.status;
            transerToOfficeFormattedMessage.message = this.getFormattedFailureMessage(failureReponse);
        } else {
            const successMessage = transferToOfficeResponse as OutstandingFundsTransferResponse;
            transerToOfficeFormattedMessage.statusCode = 200;
            transerToOfficeFormattedMessage.message = this.getFormattedSuccessMessage(successMessage);
        }
        return transerToOfficeFormattedMessage;
    }

    private getFormattedFailureMessage(transferToOfficeResponse: MultipleOperationsResultProblemDetails) {
        let message = `Failed to transfer the following outstanding fund records to their corresponding office accounts:\n`;
        for (const failure of transferToOfficeResponse.failures) {
            message += `OutstandingFund of Id: ${failure.id} failed due to: ${failure.reason}\n`;
        }
        return message;
    }

    private getFormattedSuccessMessage(transferToOfficeResponse: OutstandingFundsTransferResponse) {
        let message = `The following outstanding fund records were successfully transferred to their corresponding office accounts:\n`;
        for (const success of transferToOfficeResponse.successes) {
            message += `${success}\n`;
        }
        return message;
    }
}

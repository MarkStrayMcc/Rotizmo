import {
    FinancialItemStatus
} from '@app/models';

export const paymentStatuses = [
    {
        text: FinancialItemStatus[FinancialItemStatus.Requested],
        value: FinancialItemStatus.Requested
    },
    {
        text: "Pending Approval",
        value: FinancialItemStatus.PendingApproval
    },
    {
        text: FinancialItemStatus[FinancialItemStatus.Paid],
        value: FinancialItemStatus.Paid
    },
    {
        text: FinancialItemStatus[FinancialItemStatus.Rejected],
        value: FinancialItemStatus.Rejected
    },
    {
        text: "Fully Received",
        value: FinancialItemStatus.Received
    },
    {
        text: "Part Received",
        value: FinancialItemStatus.PartReceived
    },
    {
        text: "Rejected - Adjusters Request",
        value: FinancialItemStatus.RejectedAdjustersRequest
    },
    {
        text: "Rejected - Amount Requested vs Invoice Amount Differ",
        value: FinancialItemStatus.RejectedAmountDiffer
    },
    {
        text: "Rejected - Incorrect Information",
        value: FinancialItemStatus.RejectedIncorrectInformation
    },
    {
        text: "Rejected - Missing Bank Details/ Supporting Documentation",
        value: FinancialItemStatus.RejectedMissingDetails
    },
    {
        text: "Rejected - LF/ CC Raised Inadvertently",
        value: FinancialItemStatus.RejectedRaisedInadvertently
    },
    {
        text: "Rejected - Duplicate",
        value: FinancialItemStatus.RejectedDuplicate
    },
    {
        text: "Finance - Roe Correction",
        value: FinancialItemStatus.FinanceRoeCorrection
    },
    {
        text: "Finance - Reserve Correction",
        value: FinancialItemStatus.FinanceReserveCorrection
    },
    {
        text: "Sanctions - Referral",
        value: FinancialItemStatus.SanctionsReferral
    }
];

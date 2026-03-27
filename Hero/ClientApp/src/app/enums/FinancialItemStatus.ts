export enum FinancialItemStatus {
    Created = 1,
    Requested = 2,
    PendingApproval = 3,
    Paid = 4,
    Rejected = 5,
    Deleted = 6,
    Received = 7,
    PartReceived = 8,
    RejectedAdjustersRequest = 9,
    RejectedAmountDiffer = 10,
    RejectedIncorrectInformation = 11,
    RejectedMissingDetails = 12,
    RejectedRaisedInadvertently = 13,
    RejectedDuplicate = 14,
    FinanceRoeCorrection = 15,
    FinanceReserveCorrection = 16,
    SanctionsReferral = 17
}

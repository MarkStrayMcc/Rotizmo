namespace Hero.Models
{
    public enum EmailType
    {
        FailedMtaFinalization = 1,
        MtaNameChangeReviewInvitation,
        NameChangeManipulatedDocumentDone,
        NameChangeNewEndorsementDone,
        MtaAddressChangeReviewInvitation,
        AddressChangeNewEndorsementDone,
        AddressChangeManipulatedDocumentDone,
        FailedMtaReviewInvitationSending,
        AdditionalInsuredChangeNewEndorsementDone,
        LossPayeeChangeNewEndorsementDone,
        RejectedMta,
        SubjectivityReviewRejection,
        SubjectivityReviewRequest,
        SubjectivityReuseWarning,
        SanctionCheckWarning,
        SendQuote,
        SendPolicy,
        ReferQuote,
        ConnectSendQuote,
        SendQuoteWithCoverholder = 31,
        SendPolicyWithCoverholder = 33,
    }
}

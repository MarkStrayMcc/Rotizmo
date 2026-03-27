export enum QuoteState {
    InProgress = -1,
    Kill = 0,
    Create = 1,
    Approved = 2,
    Viewed = 3,
    Saved = 4, //Maps to Finished
    /// <summary>
    /// Quote has been sent via the Hero UI
    /// </summary>
    QuoteSent = 5,

    /// <summary>
    /// Bound
    /// </summary>
    Bound = 10
}
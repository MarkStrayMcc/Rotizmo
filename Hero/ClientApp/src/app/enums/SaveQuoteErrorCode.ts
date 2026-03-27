export enum SaveQuoteErrorCode {
    Others = 0,
    RetrieveQuoteFromRedis = 1,
    SaveQuoteToDatabase = 2,
    SaveQuoteDocument = 4,
    SaveRatingModelFile = 5,
    PolicyRenewal = 6,
}
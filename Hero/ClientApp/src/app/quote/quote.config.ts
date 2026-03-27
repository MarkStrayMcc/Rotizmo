import { SaveQuoteErrorCode } from "@app/models";
import { BindQuoteErrorCode } from "@app/enums/BindQuoteErrorCode";

export class QuoteConfig {
    public static StepName: { [step: number]: string } =
    {
        1: "BasicInfo",
        2: "Coverages",
        3: "Activities",
        4: "Risk",
        5: "Subjectivities",
        6: "Endorsements",
        7: "Pricing",
        8: "SaveQuote"
    };

    public static StepNr: { [step: string]: number } = {
        BasicInfo: 1,
        Coverages: 2,
        Activities: 3,
        Risk: 4,
        Subjectivities: 5,
        Endorsements: 6,
        Pricing: 7,
        SaveQuote: 8
    }

    public static SaveQuoteErrorMessages: { [id: number]: string } = {
        [SaveQuoteErrorCode.SaveQuoteToDatabase]: "Error during saving. The quote has not been saved! Please contact IT.",
        [SaveQuoteErrorCode.SaveQuoteDocument]: "Error saving the quote document.",
        [SaveQuoteErrorCode.SaveRatingModelFile]: "The quote has been saved but some errors occurred with the rating engine.",
        [SaveQuoteErrorCode.RetrieveQuoteFromRedis]: "Unable to retrieve quote from Redis.",
        [SaveQuoteErrorCode.Others]: "The quote has been saved but there have been some errors.",
        [SaveQuoteErrorCode.PolicyRenewal]: "The quote has not been saved because the expiring policy does not exist."
    }

    public static BindQuoteErrorMessages: { [id: number]: string } = {
        [BindQuoteErrorCode.BindError]: "Error during binding. The quote has not been bound.",
        [BindQuoteErrorCode.PostBindUpdatesError]: "Error during binding. The quote has been partially bound.",
        [BindQuoteErrorCode.DocumentGenerationError]: "Error generating or saving policy documents.",
        [BindQuoteErrorCode.RatingModelError]: "Error with the rating model.",
        [BindQuoteErrorCode.UnspecifiedError]: "Error during binding."
    }
}

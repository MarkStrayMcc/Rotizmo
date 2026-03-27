import { Quote } from "@app/models";
import { FeeRequest } from "@app/quote/models/Fees/FeeRequest";
import { QuoteBindRequest } from "@app/models/auto-generated/QuoteBindRequest";
import { QuoteFeeRequest } from "@app/models/auto-generated/QuoteFeeRequest";

export abstract class ModelMappingsHelper {

    public static getFeeRequest(quote: Quote, totalFeeOverride: number = null): FeeRequest {
        const feeRequest = new FeeRequest();

        feeRequest.productName = quote.product.productName;
        feeRequest.countryIsoCode = quote.insuredLocation.country.isoCode;
        feeRequest.stateIsoCode = quote.insuredLocation.stateProvinceCode??quote.client?.primaryLocation?.stateProvinceCode;
        feeRequest.quoteType = quote.quoteType;
        feeRequest.origin = quote.origin;
        feeRequest.currencyIsoCode = quote.currency.isoCode;
        feeRequest.exchangeRate = quote.currency.rate;
        feeRequest.effectiveCommission = quote.commissionInformation.actualGrossCommission;
        feeRequest.standardCommission = quote.commissionInformation.originalGrossCommission;
        feeRequest.businessLinePremiums =
            quote.pricingInformation.map(pi => ({
                businessLineCode: pi.businessLine.name,
                premium: pi.quoted !== null ? pi.quoted : 0
            }));

        if (totalFeeOverride !== null) {
            feeRequest.totalFee = totalFeeOverride;
        }

        if (quote.insuranceType) {
            feeRequest.insuranceType = quote.insuranceType;
        }

        const programCode = quote.riskQuestionAnswers.find(rqa => rqa.riskQuestionTag === "PROGRAM_CODE");
        if (programCode) {
            feeRequest.programCode = programCode.text;
        }
        feeRequest.brokerGroupId = quote.brokerTeam.broker.brokerGroupId;
        return feeRequest;
    }

    public static getQuoteFeeRequest(quoteInfo: Quote | QuoteBindRequest): QuoteFeeRequest {
        const feeRequest = new QuoteFeeRequest();
        feeRequest.countryCode = quoteInfo.insuredLocation.country.isoCode;
        feeRequest.stateCode = quoteInfo.insuredLocation.stateProvinceCode;
        feeRequest.productCode = quoteInfo.product.productName;
        feeRequest.brokerGroupId = quoteInfo.brokerTeam.broker.brokerGroupId;
        return feeRequest;
    }
}

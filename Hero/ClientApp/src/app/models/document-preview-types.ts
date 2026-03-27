import { Quote } from "@app/models/auto-generated/Quote";
import { DocumentPreviewType } from "@app/interfaces/DocumentPreviewType";
import { HttpParams } from '@angular/common/http';

export class DocumentPreviewTypes {

    public policyDocumentPreview: DocumentPreviewType = {
        title: "Policy Document Preview",
        getUrl: (quote: Quote) => `document/pdf/policy/${quote.policyNumber}`
    };

    public quoteDocumentPreview: DocumentPreviewType = {
        title: "Quote Document Preview",
        getUrl: (quote: Quote) => `document/pdf/quote/${quote.quoteReference}`
    };

    public wordingDocumentPreview: DocumentPreviewType = {
        title: "Wording Document Preview",
        getUrl: (quote: Quote) => {
            let wordingVersionId = this.getWordingVersionId(quote);
            return `document/pdf/${wordingVersionId}/${quote.insuredLocation.country.isoCode}/${quote.brokerTeam.id}${this.getParameters(quote)}`
        }
    };

    private getWordingVersionId(quote: Quote): number {
        return quote.excessWordingVersionId > 0 ? quote.excessWordingVersionId : quote.wordingVersionId;
    }

    private getParameters(quote: Quote): string {
        let params = new HttpParams()
            .set('productCode', `${quote.product.productName}`)
            .set('stateProvinceCode', `${quote.insuredLocation.stateProvinceCode}`)
            .set('isAdmitted', `${quote.product.isAdmitted}`)
            .set('cfcTeamCoverholder', `${quote.assignedContact?.cfcTeamCoverholder}`);

        let paramsStringToUse = `?${params.toString()}`;

        return paramsStringToUse;
    }
}

import { Email } from '@app/models';

export class UnderwritingDistributionEmail {
    public email: Email;
    public productCode: string;
    public countryIsoCode: string;
    public stateProvinceCode?: string;
    public wordingVersionId: number;
    public isPublished: boolean;
    public isBindable: boolean;
    public quoteUid: string;
    public quoteId: number;
    public quoteIds?: number[];
    public policyNumber?:string;
    public clientUid?: string;
    public brokerId?: number;
}


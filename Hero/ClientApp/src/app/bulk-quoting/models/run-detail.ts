
export class RunDetail {
    public id: number;
    public dateCreated: Date;
    public fileName: string;
    public brokerGroupName: string;
    public underwriter: string;
    public status: string;
    public displayStatus: string;
    public risks: RunRisk[];
}

export class RunRisk {
    public externalReference: string;
    public serviceAccountEmail: string;
    public emailStatus: string;
    public company: RunRiskCompany;
    public riskStatus: string;
    public displayStatus: string;
    public quoteRequests: QuoteRequest[];
}

export class RunRiskCompany {
    public name: string;
    public webUrl: string;
    public totalRevenue: number;
    public headCount: number;
    public activity: string;
    public address: RunRiskCompanyAddress;
}

export class RunRiskCompanyAddress {
    public lines: string[];
    public city: string;
    public stateIsoCode: string;
    public zipCode: string;
    public countryIsoCode: string;
}

export class QuoteRequest {
    result: any;
    status: string;
    templateCode: string;
}
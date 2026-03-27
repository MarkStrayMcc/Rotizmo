import { Injectable } from "@angular/core";
import { environment } from "environments/environment";

@Injectable()
export class ConfigService {
    public get nerdUrl(): string {
        return environment.api.nerdUrl;
    }

    public get bulkQuotingUrl(): string {
        return environment.api.bulkQuotingUrl;
    }

    public get adminUrl(): string {
        return environment.api.adminUrl;
    }

    public get qlikDashboardUrl(): string {
        return environment.api.qlikDashboardUrl;
    }
}

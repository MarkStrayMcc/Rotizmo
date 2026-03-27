import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { Observable } from 'rxjs';
import { catchError } from "rxjs/operators";
import { AdditionalInsured } from "@app/models/auto-generated/AdditionalInsured";
import { UserService } from '@app/services/user.service';

@Injectable()
export class PolicyAdditionalInsuredService extends BaseService {
    constructor(
        protected readonly http: HttpClient,
        private readonly userService: UserService
    ) {
        super(http);
    }

    public get(policyNumber: string): Observable<AdditionalInsured[]> {
        let url = `/api/policy/${policyNumber}/additional-insured`;
        
        if (!this.userService.isFeatureAccessible("heroAdditionalInsuredMtaV2")) {
            url = `/policy/${policyNumber}/additional-insured`;
        }

        return this.http.get<AdditionalInsured[]>(url).pipe(catchError(this.handleErrorObservable));
    }
}

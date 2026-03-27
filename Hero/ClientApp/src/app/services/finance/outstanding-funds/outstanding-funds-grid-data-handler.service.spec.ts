import { TestBed, inject } from "@angular/core/testing";
import { OutstandingFundsGridDataHandlerService } from "./outstanding-funds-grid-data-handler.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ConfigService } from "@app/services/config.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { UserService } from "@app/services/user.service";
import { CookieService } from "ngx-cookie-service";

class MockErrorMessageHandlerService {
    public handleError(error): void { return; }
    public handleWarning(warning): void { return; }
    public handleErrorsByStatusCode(error, statusCode): void { return; }
}

describe("OutstandingFundsGridDataHandlerService", () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            ConfigService,  // ledgerreferencehttpservice needs this. but it isn't used in the service directly
            CfcBankAccountService,
            LedgerReferenceHttpService,
            UserService,
            CookieService, // this is required by the UserService
            { provide: ErrorMessageHandlerService, useClass: MockErrorMessageHandlerService },
            OutstandingFundsGridDataHandlerService
        ],
        imports: [HttpClientTestingModule]
    }));

    it("should be created", () => {
        const service: OutstandingFundsGridDataHandlerService = TestBed.inject(OutstandingFundsGridDataHandlerService);
        expect(service).toBeTruthy();
    });
});

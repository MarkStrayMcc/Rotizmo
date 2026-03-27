import { async, inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { FinancialLedgerInfo } from "@app/models";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { ConfigService } from "@app/services/config.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

function getTestLedgerReferencesInfo(): FinancialLedgerInfo[] {
    return [
        {
            "financialLedgerId": 398,
            "ledgerReference": "SA090000Y",
            "binderId": 1,
            "binderYear": "Y",
            "sectionId": 1,
            "lloydsRiskCode": null,
            "description": null,
            "binderDescription": "ProSurance",
            "allowedLloydsRiskCodes": ["E3", "E5", "E7", "E9"],
            "shortCode": "A",
            "binderYearNo": 2009
        } as FinancialLedgerInfo,
        {
            "financialLedgerId": 315,
            "ledgerReference": "BA090080Y",
            "binderId": 2,
            "binderYear": "f",
            "sectionId": 1,
            "lloydsRiskCode": null,
            "description": null,
            "binderDescription": "BroSurance for brothers",
            "allowedLloydsRiskCodes": ["B3", "B5", "B7", "B9"],
            "shortCode": "B",
            "binderYearNo": 2001
        } as FinancialLedgerInfo
    ];
}

describe("Ledger Reference Http Service Tests",
    () => {
        beforeEach(async(
            () => {
                TestBed.configureTestingModule({
                    providers: [
                        {
                            provide: XHRBackend,
                            useClass: MockBackend
                        },
                        LedgerReferenceHttpService,
                        ConfigService
                    ],
                    imports: [
                        HttpClientTestingModule
                    ]
                });
            }));

        it("should fetch all ledger references",
            inject(
                [
                    XHRBackend,
                    LedgerReferenceHttpService
                ],
                (
                    mockBackend: MockBackend,
                    ledgerReferenceHttpService: LedgerReferenceHttpService
                ) => {
                    const mockLedgerInfo = getTestLedgerReferencesInfo();
                    mockBackend.connections.subscribe(
                        (connection: MockConnection) => {
                            expect(connection.request.method).toBe(RequestMethod.Get);
                            connection.mockRespond(
                                new Response(
                                    new ResponseOptions(
                                        {
                                            body: JSON.stringify(mockLedgerInfo),
                                            status: 200
                                        }
                                    )
                                )
                            );
                        }
                    );
                    ledgerReferenceHttpService.getLedgerReferences()
                        .subscribe(
                        (ledgerReferencesInfo: FinancialLedgerInfo[]) => {
                            expect(ledgerReferencesInfo).toBeDefined();
                            expect(ledgerReferencesInfo.length).toBe(2);
                            expect(ledgerReferencesInfo[0].allowedLloydsRiskCodes).toBeDefined();
                            expect(ledgerReferencesInfo[0].allowedLloydsRiskCodes.length).toBe(4);
                        }
                    );
                }
            ));
    });

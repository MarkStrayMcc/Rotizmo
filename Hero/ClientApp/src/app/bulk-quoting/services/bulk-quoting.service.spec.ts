import { HttpEvent, HttpEventType } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { async, TestBed } from "@angular/core/testing";
import { DropDownItem } from "@app/models";
import { ConfigService } from "@app/services/config.service";
import { BulkQuotingService } from './bulk-quoting.service';


describe("BulkQuotingService", () => {
    let httpMock: HttpTestingController;
    let bulkQuotingService: BulkQuotingService;
    let configService: ConfigService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                BulkQuotingService,
                ConfigService
            ],
            imports: [HttpClientTestingModule]
        });

        bulkQuotingService = TestBed.inject(BulkQuotingService);
        httpMock = TestBed.inject(HttpTestingController);
        configService = TestBed.inject(ConfigService);
    }));

    it("should be created", () => {
        expect(bulkQuotingService).toBeTruthy();
    });

    it("should call getUploadHistory endpoint", () => {
        const response = "history";

        bulkQuotingService.getUploadHistory().subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.body).toEqual(response);
            }
        });

        const mockReq = httpMock.expectOne(`${configService.bulkQuotingUrl}/runs?pageNumber=1&pageSize=20`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("GET");
        mockReq.flush(response);

        httpMock.verify();
    });

    it("should call getBrokers endpoint", () => {
        const dropDownItem = new DropDownItem("test", "test", "test.jpg");
        const response = [dropDownItem];

        bulkQuotingService.getBrokers().subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.body).toEqual(response);
            }
        });

        const mockReq = httpMock.expectOne(`${configService.bulkQuotingUrl}/brokercompanies`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("GET");
        mockReq.flush(response);

        httpMock.verify();

    });
});

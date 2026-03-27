import { HttpEvent, HttpEventType } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { async, TestBed } from "@angular/core/testing";
import { ActivityHttpService } from "./activity-http.service";

describe("ActivityHttpService", () => {
    let httpMock: HttpTestingController;
    let activityHttpService: ActivityHttpService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [ActivityHttpService],
            imports: [HttpClientTestingModule]
        });
        activityHttpService = TestBed.inject(ActivityHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    }));

    describe("searchByProductCodeAndActivityName tests", () => {
        it("should call searchByProductCodeAndActivityName with product name and the activity code and the response should be a list of activity codes and searchable terms", () => {
            const response = [{
                activityCode: "ED0201",
                searchableTerm: "Education > Primary & Secondary Schools > State Primary School"
            }];

            activityHttpService.searchByProductCodeAndActivityName("CPM", "EDU").subscribe((responseEvent: HttpEvent<any>) => {
                switch (responseEvent.type) {
                    case HttpEventType.Response:
                        expect(responseEvent.ok).toBeTruthy();
                        expect(responseEvent.body).toEqual(response);
                }
            });

            const mockReq = httpMock.expectOne(`/activity/search?productCode=CPM&name=EDU`);

            expect(mockReq.cancelled).toBeFalsy();
            expect(mockReq.request.responseType).toEqual('json');
            expect(mockReq.request.method).toBe("GET");
            mockReq.flush(response);

            httpMock.verify();
        });

        it("should call searchByProductCodeAndActivityName with product name including an ampersand and the activity code and it should encode the product name and the response should be a list of activity codes and searchable terms", () => {
            const response = [{
                activityCode: "ED0201",
                searchableTerm: "Education > Primary & Secondary Schools > State Primary School"
            }];

            activityHttpService.searchByProductCodeAndActivityName("O&G", "EDU").subscribe((responseEvent: HttpEvent<any>) => {
                switch (responseEvent.type) {
                    case HttpEventType.Response:
                        expect(responseEvent.ok).toBeTruthy();
                        expect(responseEvent.body).toEqual(response);
                }
            });

            const mockReq = httpMock.expectOne(`/activity/search?productCode=O%26G&name=EDU`);

            expect(mockReq.cancelled).toBeFalsy();
            expect(mockReq.request.responseType).toEqual('json');
            expect(mockReq.request.method).toBe("GET");
            mockReq.flush(response);

            httpMock.verify();
        });
    });

    describe("getActivityByProductIdAndParentId tests", () => {
        it("should call getActivityByProductIdAndParentId with null as parent id and retrieve a list of activities", () => {
            const response = [{
                activityMapId: 1000,
                activityMasterId: 263,
                code: "AE",
                description: "Agriculture and Environmental",
                numberOfAvailableActivities: 0,
                parentActivityMapId: null,
                productId: 21
            }];

            activityHttpService.getActivityByProductIdAndParentId(21, null).subscribe((responseEvent: HttpEvent<any>) => {
                switch (responseEvent.type) {
                    case HttpEventType.Response:
                        expect(responseEvent.ok).toBeTruthy();
                        expect(responseEvent.body).toEqual(response);
                }
            });

            const mockReq = httpMock.expectOne(`/activitymap/getactivity?productId=21&parentId=`);

            expect(mockReq.cancelled).toBeFalsy();
            expect(mockReq.request.responseType).toEqual('json');
            expect(mockReq.request.method).toBe("GET");
            mockReq.flush(response);

            httpMock.verify();
        });

        it("should call getActivityByProductIdAndParentId with a number as parent id and retrieve a list of activities", () => {
            const response = [{
                activityMapId: 1000,
                activityMasterId: 263,
                code: "AE",
                description: "Agriculture and Environmental",
                numberOfAvailableActivities: 0,
                parentActivityMapId: 2,
                productId: 21
            }];

            activityHttpService.getActivityByProductIdAndParentId(21, 2).subscribe((responseEvent: HttpEvent<any>) => {
                switch (responseEvent.type) {
                    case HttpEventType.Response:
                        expect(responseEvent.ok).toBeTruthy();
                        expect(responseEvent.body).toEqual(response);
                }
            });

            const mockReq = httpMock.expectOne(`/activitymap/getactivity?productId=21&parentId=2`);

            expect(mockReq.cancelled).toBeFalsy();
            expect(mockReq.request.responseType).toEqual('json');
            expect(mockReq.request.method).toBe("GET");
            mockReq.flush(response);

            httpMock.verify();
        });
    });

    describe("getActivityByProductCodeAndActivityCode tests", () => {
        it("should call getActivityByProductCodeAndActivityCode with product name and the activity code and the response should be a list of activity codes and searchable terms", () => {
            const response = [{
                activityCode: "ED0201",
                searchableTerm: "Education > Primary & Secondary Schools > State Primary School"
            }];

            activityHttpService.getActivityByProductCodeAndActivityCode("CPM", "EDU").subscribe((responseEvent: HttpEvent<any>) => {
                switch (responseEvent.type) {
                    case HttpEventType.Response:
                        expect(responseEvent.ok).toBeTruthy();
                        expect(responseEvent.body).toEqual(response);
                }
            });

            const mockReq = httpMock.expectOne(`/activitymap/activity-tree?productCode=CPM&childActivityCode=EDU`);

            expect(mockReq.cancelled).toBeFalsy();
            expect(mockReq.request.responseType).toEqual('json');
            expect(mockReq.request.method).toBe("GET");
            mockReq.flush(response);

            httpMock.verify();
        });

        it("should call getActivityByProductCodeAndActivityCode with product name including an ampersand and the activity code and it should encode the product name and the response should be a list of activity codes and searchable terms", () => {
            const response = [{
                activityCode: "ED0201",
                searchableTerm: "Education > Primary & Secondary Schools > State Primary School"
            }];

            activityHttpService.getActivityByProductCodeAndActivityCode("O&G", "EDU").subscribe((responseEvent: HttpEvent<any>) => {
                switch (responseEvent.type) {
                    case HttpEventType.Response:
                        expect(responseEvent.ok).toBeTruthy();
                        expect(responseEvent.body).toEqual(response);
                }
            });

            const mockReq = httpMock.expectOne(`/activitymap/activity-tree?productCode=O%26G&childActivityCode=EDU`);

            expect(mockReq.cancelled).toBeFalsy();
            expect(mockReq.request.responseType).toEqual('json');
            expect(mockReq.request.method).toBe("GET");
            mockReq.flush(response);

            httpMock.verify();
        });
    });
});

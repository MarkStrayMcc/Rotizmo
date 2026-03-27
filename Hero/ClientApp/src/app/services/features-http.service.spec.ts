import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { FeatureAccess } from "@app/models";
import { FeaturesHttpService } from "@app/services/features-http.service";

describe("FeaturesHttpService",
    () => {
        /**
         * XHRBackend and MockBackend providers required for mocking http requests
         **/
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: XHRBackend,
                        useClass: MockBackend
                    },
                    FeaturesHttpService
                ],
                imports: [HttpClientTestingModule]
            });
        }));

        it("should be created",
            inject([FeaturesHttpService],
                (service: FeaturesHttpService) => {
                    expect(service).toBeTruthy();
                }));

        it("'activeFeature' should return true",
            inject([XHRBackend, FeaturesHttpService],
                (mockBackend: MockBackend, featuresHttpService: FeaturesHttpService) => {
                    mockBackend.connections.subscribe(
                        (connection: MockConnection) => {
                            expect(connection.request.method).toBe(RequestMethod.Get);
                            expect(connection.request.url).toBe("features/IsFeatureActive?featureName=activeFeature&brokerContactId=0");
                            const featureAccessReturned = new FeatureAccess();
                            featureAccessReturned.hasAccess = true;
                            featureAccessReturned.featureName = "activeFeature";

                            connection.mockRespond(new Response(new ResponseOptions({
                                body: JSON.stringify(featureAccessReturned),
                                status: 200
                            })));
                        }
                    );
                    featuresHttpService.isFeatureActive("activeFeature").subscribe(
                        (featureStatus: FeatureAccess) => {
                            expect(featureStatus).toBeDefined();
                            expect(featureStatus.hasAccess).toBeTruthy();
                        });
                }));

        it("'inactiveFeature' should return false",
            inject([XHRBackend, FeaturesHttpService],
                (mockBackend: MockBackend, featuresHttpService: FeaturesHttpService) => {
                    mockBackend.connections.subscribe(
                        (connection: MockConnection) => {
                            expect(connection.request.method).toBe(RequestMethod.Get);
                            expect(connection.request.url).toBe("features/IsFeatureActive?featureName=inactiveFeature&brokerContactId=0");
                            const featureAccessReturned = new FeatureAccess();
                            featureAccessReturned.hasAccess = false;
                            featureAccessReturned.featureName = "inactiveFeature";
                            connection.mockRespond(new Response(new ResponseOptions({
                                body: JSON.stringify(featureAccessReturned),
                                status: 200
                            })));
                        }
                    );
                    featuresHttpService.isFeatureActive("inactiveFeature").subscribe(
                        (featureStatus: FeatureAccess) => {
                            expect(featureStatus).toBeDefined();
                            expect(featureStatus.hasAccess).toBeFalsy();
                        });
                }));
    });

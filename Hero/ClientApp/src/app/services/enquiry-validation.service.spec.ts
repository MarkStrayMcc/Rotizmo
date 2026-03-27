import { TestBed, inject } from "@angular/core/testing";
import { EnquiryValidationService } from "@app/services/enquiry-validation.service";
import { Enquiry } from "@app/quote/models/enquiry/Enquiry";

/**
 * Tests for EnquiryValidationService.
 */
describe("EnquiryValidationService",
    () => {
        let enquiryValidationService: EnquiryValidationService;
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    EnquiryValidationService
                ]
            });
        });

        it("returns invalid (false) if nerd version is not 3",
            inject([EnquiryValidationService], (enquiryValidationService: EnquiryValidationService) => {
                let dummyEnquiry = new Enquiry();
                dummyEnquiry.nerdVersion = 2;

                // Act
                let result = enquiryValidationService.ValidateHeroEnquiry(dummyEnquiry);

                // Assert
                expect(result).toBeFalsy();
            }));

        it("returns invalid (false) if enquiry is null",
            inject([EnquiryValidationService], (enquiryValidationService: EnquiryValidationService) => {
                let dummyEnquiry = null;

                // Act
                let result = enquiryValidationService.ValidateHeroEnquiry(dummyEnquiry);

                // Assert
                expect(result).toBeFalsy();
            }));

        it("returns valid (true) if nerd version is 3",
            inject([EnquiryValidationService], (enquiryValidationService: EnquiryValidationService) => {
                let dummyEnquiry = new Enquiry();
                dummyEnquiry.nerdVersion = 3;

                // Act
                let result = enquiryValidationService.ValidateHeroEnquiry(dummyEnquiry);

                // Assert
                expect(result).toBeTruthy();
            }));
    });

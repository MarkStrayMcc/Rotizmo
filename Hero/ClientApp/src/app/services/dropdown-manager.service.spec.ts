import { inject, TestBed } from "@angular/core/testing";
import { XHRBackend } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { SurplusLine } from "@app/models";
import { DropDownManagerService } from "./dropdown-manager.service";

describe("DropDownManagerService", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                },
                DropDownManagerService
            ]
        });
    });

    it("Should be created", inject([DropDownManagerService], (service: DropDownManagerService) => {
        expect(service).toBeTruthy();
    }));

    it("Should set dropdown based on surplus line item when not null", inject([DropDownManagerService], (service: DropDownManagerService) => {
        let dummySurplus = new SurplusLine();
        dummySurplus.licenseNumber = "test";
        dummySurplus.id = 5;
        dummySurplus.brokerName = "hello";
        dummySurplus.contactName = "world";

        let result = service.setSurplusLineDropDownItem(dummySurplus);
        expect(result.value).toBe(dummySurplus.id.toString());
    }));

    it("Should set dropdown based on surplus line item when null", inject([DropDownManagerService], (service: DropDownManagerService) => {
        let result = service.setSurplusLineDropDownItem(null);
        expect(result).not.toBeNull();
    }));
});

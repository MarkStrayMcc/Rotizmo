import { Component, Injectable, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from '@angular/router/testing';
import { DocumentPreviewType } from "@app/interfaces/DocumentPreviewType";
import { MaterialModule } from "@app/material/material.module";
import { Policy } from "@app/models/auto-generated/Policy";
import { Quote } from "@app/models/auto-generated/Quote";
import { PolicyItemComponent } from "@app/policy/policy-item.component";
import { ConfigService } from '@app/services/config.service';
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { PreviewDocumentModalService } from "@app/services/preview-document-modal.service";
import { UserService } from '@app/services/user.service';
import { environment } from 'environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { of } from "rxjs";
import { MockUserService } from "./mocks/mta.mocks";
import { MtaSelectionType } from "./mta/mta-selection.config";
import { MtaTypeMenuComponent } from './mta/mta-type-menu/mta-type-menu.component';
import { MtaCancellationComponent } from "./mta/popups/cancellation/cancellation.component";
import { MtaAbInitioCancellationComponent } from "./mta/popups/mta-ab-initio-cancellation/mta-ab-initio-cancellation.component";
import { MtaModalModel } from "./mta/popups/mta-modal.model";

describe("PolicyItemComponent", () => {
    let component: PolicyItemComponent;
    let fixture: ComponentFixture<PolicyItemComponent>;
    let previewDocumentModalService: PreviewDocumentModalService;
    let navigationOverrideService: NavigationOverrideService;
    let userService: UserService;

    const testPolicy = {
        reference: "ESJTEST01",
        companyName: "companyName",
        brokerName: "brokerName",
        productName: "CPM",
        nerdVersion: 3,
        policyType: "",
        expirationDate: "2030-06-08T09:57:36.242Z",
        companyGuid: "",
        policyUid: "",
        inceptionDate: "2020-06-08T09:57:36.242Z"
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                PolicyItemComponent,
                MockMenuComponent,
                MtaTypeMenuComponent
            ],
            providers: [
                { provide: PreviewDocumentModalService, useClass: MockPreviewDocumentModalService },
                { provide: ModalDialogService, useClass: MockModalDialogService },
                { provide: NavigationOverrideService, useClass: MockNavigationOverride },
                { provide: ConfigService, useClass: MockConfigService },
                { provide: UserService, useClass: MockUserService },
                { provide: CookieService, useClass: CookieService }
            ],
            imports: [MaterialModule, RouterTestingModule],
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PolicyItemComponent);

        component = fixture.componentInstance;
        component.policy = testPolicy;
        component["modalModel"] = new MtaModalModel();

        previewDocumentModalService = TestBed.inject(PreviewDocumentModalService);
        navigationOverrideService = TestBed.inject(NavigationOverrideService);
        userService = TestBed.inject<UserService>(UserService);

        spyOn(previewDocumentModalService, "openPreviewDocumentDialog").and.callThrough();

        fixture.detectChanges();
    });

    it("Should create PolicyItemComponent", () => {
        expect(component).toBeTruthy();
    });

    it("Should call preview document modal service", () => {
        // Act
        component.openPreviewDocumentDialog(component.previewTypes.policyDocumentPreview);

        // Assert
        expect(previewDocumentModalService.openPreviewDocumentDialog).toHaveBeenCalledTimes(1);
    });

    it("Should open the Address Change mta modal when clicked and it is a HERO policy", () => {
        // Assert
        const openDialogSpy = spyOn<any>(component.modalDialogService, "openDialog");

        // Act
        component.mtaTypeClicked({ mtaType: "Address Change", policy: testPolicy });

        // Assert
        expect(openDialogSpy.calls.mostRecent().args[1].panelClass).toBe("modalClientManageAddress");
    });

    it("Should open the Name Change mta modal when clicked and it is a HERO policy", () => {
        // Assert
        const openDialogSpy = spyOn<any>(component.modalDialogService, "openDialog");

        // Act
        component.mtaTypeClicked({ mtaType: "Name Change", policy: testPolicy });

        // Assert
        expect(openDialogSpy.calls.mostRecent().args[1].panelClass).toBe("modalMtaNameChange");
    });

    it("Should open the Additional Insured mta modal when clicked and it is a HERO policy", () => {
        // Assert
        const openDialogSpy = spyOn<any>(component.modalDialogService, "openDialog");

        // Act
        component.mtaTypeClicked({ mtaType: "Additional Insured", policy: testPolicy });

        // Assert
        expect(openDialogSpy.calls.mostRecent().args[1].panelClass).toBe("modalMtaAdditionalInsured");
    });

    it("Should open the Loss Payee mta modal when clicked and it is a HERO policy", () => {
        // Assert
        const openDialogSpy = spyOn<any>(component.modalDialogService, "openDialog");

        // Act
        component.mtaTypeClicked({ mtaType: "Loss Payee", policy: testPolicy });

        // Assert
        expect(openDialogSpy.calls.mostRecent().args[1].panelClass).toBe("modalMtaLossPayee");
    });

    it("Should open the Cancellation mta modal when clicked and it is a HERO policy", () => {
        // Assert
        const openDialogSpy = spyOn<any>(component.modalDialogService, "openDialog");

        // Act
        component.mtaTypeClicked({ mtaType: "Cancellation", policy: testPolicy });

        // Assert
        expect(openDialogSpy.calls.mostRecent().args[1].panelClass).toBe("modalMtaCancellation");
    });

    it("Should open the Register Manual MTA modal when clicked and it is a HERO policy", () => {
        // Assert
        const openDialogSpy = spyOn<any>(component.modalDialogService, "openDialog");

        // Act
        component.mtaTypeClicked({ mtaType: "Register Manual MTA", policy: testPolicy });

        // Assert
        expect(openDialogSpy.calls.mostRecent().args[1].panelClass).toBe("modalManualMta");
    });

    it("Should allow navigation", () => {
        // Arrange
        navigationOverrideService.allowNavigation = false;

        // Act
        component.allowNavigation();

        // Assert
        expect(navigationOverrideService.allowNavigation).toBeTruthy();
    });

    it("Should call preview document modal service with policy reference", () => {
        // Arrange
        component.policy.reference = "12345";

        // Act
        component.openPreviewDocumentDialog(component.previewTypes.policyDocumentPreview);

        // Assert
        expect(previewDocumentModalService.openPreviewDocumentDialog)
            .toHaveBeenCalledWith(
                component.previewTypes.policyDocumentPreview,
                jasmine.objectContaining({ policyNumber: "12345" }));
    });

    it("Should return Policy download URL", () => {
        // Arrange
        component.policy.reference = "12345";

        // Act
        var result = component.getPolicyDownloadUrl();

        // Assert
        expect(result).toEqual("document/pdf/policy/12345");
    });

    describe("mtaTypeClicked", () => {
        it("should open the ab initio cancellation modal if the mid term feature is toggle off", () => {
            // Arrange
            spyOn(userService, "isFeatureAccessible").and.returnValue(false);
            spyOn<any>(component.modalDialogService, "openDialog").and.callFake(function() {
                // Assert
                expect(arguments[0]).toEqual(MtaAbInitioCancellationComponent);
            });;

            // Act
            component.mtaTypeClicked({ mtaType: "Cancellation", policy: testPolicy });    
        });

        it("should open the cancellation modal if the mid term feature is toggle on", () => {
            // Arrange
            spyOn(userService, "isFeatureAccessible").and.returnValue(true);
            spyOn<any>(component.modalDialogService, "openDialog").and.callFake(function() {
                // Assert
                expect(arguments[0]).toEqual(MtaCancellationComponent);
            });;

            // Act
            component.mtaTypeClicked({ mtaType: "Cancellation", policy: testPolicy });    
        });
    });
});

@Component({ selector: "menu", template: "" })
class MockMenuComponent {
    @Input() public policy: Policy;
    @Input() public mtaSelectionTypes: MtaSelectionType[];
}

@Injectable()
class MockPreviewDocumentModalService {
    public openPreviewDocumentDialog(
        previewType: DocumentPreviewType,
        quote: Quote,
        afterClose: (obj: number) => void = null
    ) { }
}

@Injectable()
class MockNavigationOverride {
    public allowNavigation: boolean;
}

@Injectable()
class MockConfigService {
    public get nerdUrl(): string {
        return environment.api.nerdUrl;
    }
}

let confirmationResult = true;
@Injectable()
class MockModalDialogService {
    public openDialog<T, TY>(obj) { return; }
    afterClosed() {
        return {
            afterClosed: () => of(confirmationResult)
        };
    }
}

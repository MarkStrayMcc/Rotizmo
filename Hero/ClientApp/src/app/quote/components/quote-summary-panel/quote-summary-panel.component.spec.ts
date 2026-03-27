/* tslint:disable:max-classes-per-file */
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { ComponentFixture, fakeAsync, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { MessageType } from "@app/enums/MessageType";
import { DocumentPreviewType } from "@app/interfaces/DocumentPreviewType";
import { MaterialModule } from "@app/material/material.module";
import {
    Broker,
    CfcContact,
    FeatureAccess,
    Quote,
    RiskQuestion,
    RiskQuestionAnswer,
    RiskQuestionType
} from "@app/models";
import { Message } from "@app/models/Message";
import { QuoteSummaryPanelComponent } from "@app/quote/components/quote-summary-panel/quote-summary-panel.component";
import { MockPremiumCalculationsService, MockQuoteService } from "@app/quote/quote.component.mock";
import { ClientFolderService } from "@app/services/client-folder.service";
import { FeaturesHttpService } from "@app/services/features-http.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { PreviewDocumentModalService } from "@app/services/preview-document-modal.service";
import { RiskHttpService } from "@app/services/risk-http.service";
import { TaxHttpService } from "@app/services/tax-http.service";
import { GoodsAndServicesTaxService } from "@app/quote/services/goods-and-services-tax.service";
import { UserService } from "@app/services/user.service";
import { WarningService } from "@app/services/warning.service";
import { SharedModule } from "@app/shared/shared.module";
import { getTestQuote } from "@test-helpers/index";
import { BehaviorSubject, from, Observable, of, ReplaySubject } from "rxjs";
import {By} from "@angular/platform-browser";
import { QuoteService } from '@app/quote/services/quote.service';

describe("QuoteSummaryPanelComponent", () => {
    let component: QuoteSummaryPanelComponent;
    let fixture: ComponentFixture<QuoteSummaryPanelComponent>;
    let messageService: MessageService;
    let taxHttpService: TaxHttpService;
    let goodsAndServicesTaxService: GoodsAndServicesTaxService;
    let clientFolderService: ClientFolderService;
    let premiumCalculationsService: PremiumCalculationsService;
    let featuresHttpService: FeaturesHttpService;
    let router: Router;
    let quoteService: QuoteService;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuoteSummaryPanelComponent],
            providers: [
                { provide: PreviewDocumentModalService, useClass: MockPreviewDocumentModalService },
                { provide: ModalDialogService, useClass: MockModalDialogService },
                { provide: NavigationOverrideService, useClass: MockNavigationoverride },
                { provide: MatDialogRef, useClass: MockMatDialogRef },
                { provide: WarningService, useClass: MockWarningService },
                { provide: FeaturesHttpService, useClass: MockFeaturesHttpService },
                { provide: ClientFolderService, useClass: MockClientFolderService },
                { provide: TaxHttpService, useClass: MockTaxHttpService },
                { provide: GoodsAndServicesTaxService, useClass: MockTaxService },
                { provide: RiskHttpService, useClass: MockRiskHttpService },
                { provide: UserService, useClass: MockUserService },
                { provide: PremiumCalculationsService, useClass: MockPremiumCalculationsService },
                { provide: QuoteService, useClass: MockQuoteService },
                MessageService
            ],
            imports: [
                SharedModule,
                ReactiveFormsModule,
                MaterialModule,
                HttpClientModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([])
            ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(QuoteSummaryPanelComponent);
            messageService = TestBed.inject(MessageService);
            taxHttpService = TestBed.inject(TaxHttpService);
            goodsAndServicesTaxService = TestBed.inject(GoodsAndServicesTaxService);
            clientFolderService = TestBed.inject(ClientFolderService);
            premiumCalculationsService = TestBed.inject(PremiumCalculationsService);
            featuresHttpService = TestBed.inject(FeaturesHttpService);
            quoteService = TestBed.inject(QuoteService);

            router = TestBed.inject(Router);

            component = fixture.componentInstance;
            component.vm = getTestQuote();
            component.isGstVisible = false;

            featuresHttpService.isFeatureActive = jasmine.createSpy().and.returnValue(of(true));

            goodsAndServicesTaxService.gstUpdateHandler = jasmine.createSpy().and.callFake(() => null);

            premiumCalculationsService.premiumUpdateHandler = jasmine.createSpy().and.callFake(() => null);

            fixture.detectChanges();
        });
    }));

    it("Should navigate to new quote from ref when click new Quote", () => {
        // assemble
        const navSpy = spyOn(component.router, "navigate");
        component.vm.quoteReference = 5;

        // Act
        component.clickNewQuote();

        // Assert
        expect(navSpy).toHaveBeenCalled();
        const callArgs = navSpy.calls.first().args;
        expect(callArgs[0][0]).toEqual("quote");
        expect(callArgs[0][1].quoteRef).toEqual(component.vm.quoteReference);
        expect(callArgs[0][1].isNew).toEqual(true);
        expect(callArgs[0][1].step).toEqual(1);
    });

    it("Should clear messages and call router when new quote is clicked", () => {
        // Assemble
        const messageSpy = spyOn(messageService, "clearAllMessages");
        const routerSpy = spyOn(router, "navigate").and.callFake(() => { return Promise.resolve(true) });

        // Act
        component.clickNewQuote();

        // Assert
        expect(messageSpy).toHaveBeenCalled();
        expect(routerSpy).toHaveBeenCalled();
    });

    it("Should clear messages when update quote is clicked", () => {
        // Assemble
        messageService.clearAllMessages = jasmine.createSpy();

        // Act
        component.clickUpdateQuote();

        // Assert
        expect(messageService.clearAllMessages).toHaveBeenCalled();
    });

    it("Should get client folder when opening folder", () => {
        // Arrange
        clientFolderService.getClientFolder = jasmine.createSpy().and.returnValue(of("testClientFolderPath"));

        // Act
        component.openClientFolder();

        // Assert
        expect(clientFolderService.getClientFolder).toHaveBeenCalled();
    });

    it("Should show error message when no client folder found", () => {
        // Arrange
        clientFolderService.getClientFolder = jasmine.createSpy().and.returnValue(of(null));
        messageService.sendMessage = jasmine.createSpy();

        // Act
        component.openClientFolder();

        // Assert
        expect(messageService.sendMessage).toHaveBeenCalledWith(new Message("Client folder could not be found", MessageType.Warning));
    });

    it("Should show error message when there is an error retrieving client folder", () => {
        // Arrange
        clientFolderService.getClientFolder = jasmine.createSpy().and.returnValue(new Observable(subscriber => subscriber.error({ error: { detail: 'test' } })));
        messageService.sendMessage = jasmine.createSpy();

        // Act
        component.openClientFolder();

        // Assert
        expect(messageService.sendMessage).toHaveBeenCalledWith(new Message("Client folder could not be opened", MessageType.Warning));
    });

    it("Should display GST when tax service returns a GST is visible true", () => {
        // Arrange
        goodsAndServicesTaxService.isGstVisible = of(true);

        //Act
        fixture.detectChanges();
        component.ngOnInit();

        // Assert
        expect(component.isGstVisible).toBeTruthy();
    });

    it("Should not display GST when tax service returns a GST is visible false", () => {
        // Arrange
        goodsAndServicesTaxService.isGstVisible = of(false);

        //Act
        fixture.detectChanges();
        component.ngOnInit();

        // Assert
        expect(component.isGstVisible).toBeFalsy();
    });

    it("Should not display BrokerFee when Quote Service CommissionInformation is null", () => {
        // Arrange

        //Act
        fixture.detectChanges();
        component.ngOnInit();

        // Assert

        const brokerFeeField = fixture.debugElement.query(By.css("#broker-fee"))?.nativeElement as HTMLElement;
        expect(brokerFeeField).toBeFalsy()
    });

    it("Should display BrokerFee when Quote Service CommissionInformation is not null", () => {
        // Arrange

        component.vm.commissionInformation.brokerFee = 123;
        //Act
        fixture.detectChanges();
        component.ngOnInit();

        // Assert
        const brokerFeeField = fixture.debugElement.query(By.css("#broker-fee"))?.nativeElement as HTMLElement;
        expect(brokerFeeField).toBeTruthy()
        expect(brokerFeeField.innerHTML).toEqual("£123.00");

    });

    it("Should not display BrokerFee CommisionInformation is not null but BrokerFee is null", () => {
        // Arrange

        component.vm.commissionInformation.brokerFee = null;
        //Act
        fixture.detectChanges();
        component.ngOnInit();

        // Assert
        const brokerFeeField = fixture.debugElement.query(By.css("#broker-fee"))?.nativeElement as HTMLElement;
        expect(brokerFeeField).toBeFalsy();
    });

    it("Should display BrokerFee when Quote Service CommissionInformation is 0", () => {
        // Arrange

        component.vm.commissionInformation.brokerFee = 0;
        //Act
        fixture.detectChanges();
        component.ngOnInit();

        // Assert
        const brokerFeeField = fixture.debugElement.query(By.css("#broker-fee"))?.nativeElement as HTMLElement;
        expect(brokerFeeField).toBeTruthy()
        expect(brokerFeeField.innerHTML).toEqual("£0.00");

    });

    it("Should display Total Due when BrokerFee is null", () => {
        // Arrange
        const totalDue = 100;
        const triaPremium = 100;
        const brokerFee = null;
        const expectedTotalDue = (totalDue + triaPremium).toFixed(2);

        component.vm.commissionInformation.brokerFee = brokerFee;
        component.vm.totalDue = totalDue;
        component.vm.triaPremium = triaPremium;
        //Act
        fixture.detectChanges();
        component.ngOnInit();

        // Assert
        const totalDueField = fixture.debugElement.query(By.css("#total-due"))?.nativeElement as HTMLElement;
        expect(totalDueField).toBeTruthy()
        expect(totalDueField.innerHTML).toEqual(`£${expectedTotalDue}`);

    });

    it("Should display Total Due including BrokerFee when it has a value", () => {
        // Arrange
        const totalDue = 100;
        const triaPremium = 100;
        const brokerFee = 100;
        const expectedTotalDue = (totalDue + triaPremium + brokerFee).toFixed(2);

        component.vm.commissionInformation.brokerFee = brokerFee;
        component.vm.totalDue = totalDue;
        component.vm.triaPremium = triaPremium;
        //Act
        fixture.detectChanges();
        component.ngOnInit();

        // Assert
        const totalDueField = fixture.debugElement.query(By.css("#total-due"))?.nativeElement as HTMLElement;
        expect(totalDueField).toBeTruthy()
        expect(totalDueField.innerHTML).toEqual(`£${expectedTotalDue}`);

    });

    it("Should enable Unreserve Capacity button when hasBlastZoneCapacity is true", () => {
        // Arrange
        component.isTerrorismProduct = true;

        const mockSubject = new BehaviorSubject<boolean>(true);
        spyOn(quoteService, 'getHasBlastZoneCapacity').and.returnValue(mockSubject);

        component.hasBlastZoneCapacity();
        component.showSendAndBindAndPublishButtons = jasmine.createSpy().and.returnValue(true);
        fixture.detectChanges();
        const unreserveCapacityButton = fixture.debugElement.query(By.css("#unreserveCapacityButton"))?.nativeElement as HTMLButtonElement;
        expect(unreserveCapacityButton).toBeTruthy();
    });

    function testDocumentPreviewClick(previewType: DocumentPreviewType) {
        // Arrange
        setupDocumentPreviewSpy();
        const spy = spyOn(component["previewDocumentModalService"], "openPreviewDocumentDialog");

        // Act
        component.openPreviewDocumentDialog(component.previewTypes.policyDocumentPreview)

        // Assert
        expect(spy).toHaveBeenCalledWith(previewType, component.vm);
    }

    function setupDocumentPreviewSpy(): void {
        component.vm.wordingVersionId = 12345;
        component.vm.quoteReference = 12345;
        component.vm.policyNumber = "12345";
        fixture.detectChanges();
    }
});

class MockModalDialogService {
    public openDialog<T, TY>(obj) { return; }
}

class MockNavigationoverride { }

class MockMatDialogRef<T> {
    public close(dialogResult?: any): void { return; }
}

class MockWarningService {
    public hasWarning(): boolean {
        return false;
    }
}

class MockFeaturesHttpService {
    public isFeatureActive(): Observable<FeatureAccess> {

        const featureAccessDto = {
            featureName: "heroNewZealandGst",
            hasAccess: true
        } as FeatureAccess;

        return of(featureAccessDto);
    }
}

class MockClientFolderService {
    public getClientFolder() { return of("testFolderPath"); }
}

class MockPreviewDocumentModalService {
    public openPreviewDocumentDialog = () => { }
}

class MockTaxHttpService {
    public getGSTRate = () => from([0.1]);

    public getGoodsAndServicesTax = () => from([0.2]);
}

class MockTaxService {
    public isGSTRegistered = () => true;
    public updateGSTRate = () => of(0.1);
    public isGstVisible = of(true);
}

class MockRiskHttpService {
    public getRiskQuestionsForDraft = (): Observable<RiskQuestion[]> => {
        const dummyQuestion = new RiskQuestion();
        dummyQuestion.label = "the best label";
        dummyQuestion.type = RiskQuestionType.freeText;
        const result = new Array<RiskQuestion>();
        result.push(dummyQuestion);
        return of(result);
    }
}

class MockUserService {
    public getData(): Observable<CfcContact> {
        const subject = new ReplaySubject<CfcContact>(1);
        subject.next(new CfcContact());
        return subject.asObservable();
    }
    public isFeatureAccessible(): boolean { return true; }
    public cfcTeamCoverholder = new BehaviorSubject("");
}

function getAusTestQuote(): Quote {
    let quote = getTestQuote();
    quote.insuredLocation = mockAusInsureLocation;
    quote.riskQuestionAnswers = mockRiskAnswers;
    return quote;
}

const mockRiskAnswers = [
    new RiskQuestionAnswer(
        0,
        0,
        "TOTAL_REVENUE",
        null,
        null,
        null,
        null,
        111,
        null,
        1,
        8),
    new RiskQuestionAnswer(
        0,
        0,
        "US_PERCENT",
        null,
        null,
        1,
        null,
        null,
        null,
        1,
        7),
    new RiskQuestionAnswer(
        0,
        0,
        "HEAD_COUNT",
        null,
        1,
        null,
        null,
        null,
        null,
        1,
        2),
    new RiskQuestionAnswer(
        0,
        0,
        "GST_Registered",
        "Yes",
        null,
        null,
        null,
        null,
        "f7546a57-344a-4b7f-bf7d-e88658204df6",
        1,
        3)
]

const mockAusInsureLocation = {
    "clientLocationId": 1048514,
    "clientId": 784364,
    "address1": " Australia Street",
    "address2": "",
    "address3": "",
    "city": "Camperdown",
    "countryId": 3,
    "postcode": "2050",
    "isPrimaryLocation": false,
    "stateProvinceCode": "NSW",
    "county": "Inner West Council",
    "disabledOn": null,
    "country": {
        "countryId": 3,
        "name": "Australia",
        "isoCode": "AU",
        "currency": {
            "id": 5,
            "name": "Australia Dollars",
            "isoCode": "AUD",
            "symbol": "$",
            "rate": 1.859238
        }
    }
}

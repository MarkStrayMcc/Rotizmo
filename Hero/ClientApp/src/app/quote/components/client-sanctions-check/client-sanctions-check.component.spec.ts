import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SanctionStage } from "@app/enums/SanctionStage";
import { Message, MessageCategory, MessageType } from "@app/models";
import { QuoteModule } from "@app/quote/quote.module";
import { QuoteService } from "@app/quote/services/quote.service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { of } from "rxjs";
import { first } from "rxjs/operators";
import { Shallow } from "shallow-render";
import { getTestQuote } from "test-helpers";
import { CheckClientSanctionsService } from "./check-client-sanctions.service";
import { ClientSanctionsCheckComponent } from "./client-sanctions-check.component";

describe("ClientSanctionsCheckComponent", () => {
    let shallow: Shallow<ClientSanctionsCheckComponent>;
    let component: ClientSanctionsCheckComponent;
    let componentFixture: ComponentFixture<ClientSanctionsCheckComponent>;

    beforeEach(async () => {
        shallow = new Shallow(ClientSanctionsCheckComponent, QuoteModule)
            .mock(UserService, { isFeatureAccessible: () => true })
            .mock(MessageService, {
                clearMessage: jasmine.createSpy("MessageService.clearMessage"),
                sendMessage: jasmine.createSpy("MessageService.sendMessage"),
            })
            .mock(QuoteService, {
                getQuoteProperty$: () => of(mockClientLocation),
                getQuoteReference: () => getTestQuote(),
            })
            .mock(CheckClientSanctionsService, {
                checkClientSanctions: jasmine.createSpy().and.returnValue(of(true)),
            });

        const { instance, fixture } = await shallow.render({
            detectChanges: false,
        });
        component = instance;
        componentFixture = fixture;
    });

    describe("constructor", () => {
        it("should create component", () => {
            componentFixture.detectChanges();
            expect(component).toBeDefined();
        });
    });

    describe("watchClientLocationChanges$", () => {
        it("should return the client primary location", async () => {
            componentFixture.detectChanges();
            const clientLocation = await component.clientLocation$.pipe(first()).toPromise();
            expect(clientLocation).toEqual(mockClientLocation);
        });
    });

    describe("clientSanctionsCheck", () => {
        let checkClientSanctionsService: CheckClientSanctionsService;
        let quoteService: QuoteService;
        let messageService: MessageService;

        beforeEach(() => {
            quoteService = TestBed.inject(QuoteService);
            messageService = TestBed.inject(MessageService);
            checkClientSanctionsService = TestBed.inject(CheckClientSanctionsService);
        });

        it("should call client sanction check with company name and country iso code and isSendEmail", async () => {
            componentFixture.detectChanges();
            expect(checkClientSanctionsService.checkClientSanctions).toHaveBeenCalledTimes(1);
            expect(checkClientSanctionsService.checkClientSanctions).toHaveBeenCalledWith(
                getTestQuote().client.companyName,
                getTestQuote().client.uid,
                getTestQuote().client.id,
                mockClientLocation.country.isoCode,
                SanctionStage.PreQuote,
                false
            );
        });

        it("should display warning if client is sanctioned", async () => {
            const expextedMessage = new Message(
                "The client has been flagged by sanctions checking and will be automatically referred to the Compliance team once the quote is saved.",
                MessageType.Warning
            );

            componentFixture.detectChanges();

            expect(messageService.clearMessage).toHaveBeenCalledTimes(1);
            expect(messageService.clearMessage).toHaveBeenCalledWith(MessageCategory.SanctionsCheck);
            expect(messageService.sendMessage).toHaveBeenCalledTimes(1);
            expect(messageService.sendMessage).toHaveBeenCalledWith(expextedMessage, MessageCategory.SanctionsCheck);
        });

        it("should not display warning if client is not sanctioned", async () => {
            // Arrange
            checkClientSanctionsService.checkClientSanctions = jasmine.createSpy().and.returnValue(of(false));

            // Act
            componentFixture.detectChanges();

            // Assert
            expect(messageService.clearMessage).toHaveBeenCalledTimes(1);
            expect(messageService.clearMessage).toHaveBeenCalledWith(MessageCategory.SanctionsCheck);
            expect(messageService.sendMessage).toHaveBeenCalledTimes(0);
        });
    });
});

const mockCountry = {
    countryId: 1,
    name: "UK",
    isoCode: "GB",
    currency: {
        id: 3,
        name: "United Kingdom Pounds",
        isoCode: "GBP",
        symbol: "£",
        rate: 1,
    },
};

const mockClientLocation = {
    clientLocationId: 1042433,
    clientId: 784364,
    address1: "5807 South Woodlawn Avenue",
    address2: "",
    address3: "",
    city: "Chicago",
    countryId: 4,
    postcode: "60637",
    isPrimaryLocation: true,
    stateProvinceCode: "MI",
    county: "Cook County",
    disabledOn: null,
    country: mockCountry,
};

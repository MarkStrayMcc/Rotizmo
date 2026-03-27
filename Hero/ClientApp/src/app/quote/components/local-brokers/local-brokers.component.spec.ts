import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BehaviorSubject, of } from "rxjs";
import { take } from "rxjs/operators";
import { Shallow } from "shallow-render";

import { BrokerTeam, Quote } from "@app/models";
import { QuoteModule } from "@app/quote/quote.module";
import { QuoteService } from "@app/quote/services/quote.service";
import { LocalBrokersComponent } from "./local-brokers.component";
import { BrokerTeamHttpService } from "@app/quote/services/broker-team.http-service";
import { CountryService } from "@app/quote/services/country.service";
import { getTestQuote } from "test-helpers";
import { Validators } from "@angular/forms";
import { RequestEnrichmentHttpService } from '@app/services/request-enrichment-http.service';
import { FeaturesHttpService } from '@app/services/features-http.service';

describe("LocalBrokersComponent", () => {
    let shallow: Shallow<LocalBrokersComponent>;

    beforeEach(() => {
        shallow = new Shallow(LocalBrokersComponent, QuoteModule)
            .mock(BrokerTeamHttpService, { get: () => of() })
            .mock(QuoteService, { quote: of(getTestQuote()), setPropertyValue: () => {}, getQuote: () => getTestQuote() })
            .mock(RequestEnrichmentHttpService, { getApprovedStatesByCountryId: () => of([]) })
            .mock(FeaturesHttpService, { isFeatureActive: () => of({ hasAccess: true }) });
    });

    describe("constructor", () => {
        let component: LocalBrokersComponent;

        beforeEach(async () => {
            const { instance } = await shallow.render({ detectChanges: false });
            component = instance;
        });

        it("should create component", () => {
            expect(component).toBeDefined();
        });

        it("should create a local broker control", () => {
            expect(component.formControl).toBeDefined();
        });
    });

    describe("ngOnInit", () => {
        let component: LocalBrokersComponent;
        let componentFixture: ComponentFixture<LocalBrokersComponent>;

        let mockBrokerTeamHttpService: BrokerTeamHttpService;
        let mockQuoteService: QuoteService;

        beforeEach(async () => {
            const { instance, fixture } = await shallow.render({ detectChanges: false });

            component = instance;
            componentFixture = fixture;

            mockBrokerTeamHttpService = TestBed.inject(BrokerTeamHttpService);
            mockQuoteService = TestBed.inject(QuoteService);
        });

        describe("required", () => {
            it("should add required validator to if true", () => {
                // Act
                component.required = true;

                // Assert
                expect(component.formControl.hasValidator(Validators.required)).toBe(true);
            });

            it("should remove required validator to if false", () => {
                // Act
                component.required = false;

                // Assert
                expect(component.formControl.hasValidator(Validators.required)).toBe(false);
            });
        });

        describe("localBrokers$", () => {
            it("should get broker teams for Canada when insured location country ISO code is Canadian", async () => {
                // Arrange
                mockQuoteService.quote = of(<Quote>{ insuredLocation: { country: { isoCode: "CA" } } });
                componentFixture.detectChanges();

                // Act
                await component.localBrokers$.pipe(take(1)).toPromise();

                // Assert
                expect(mockBrokerTeamHttpService.get).toHaveBeenCalledTimes(1);
                expect(mockBrokerTeamHttpService.get).toHaveBeenCalledWith(["CA"]);
            });

            it("should get broker teams for EEA when insured location country ISO code is EEA", async () => {
                // Arrange
                mockQuoteService.quote = of(<Quote>{ insuredLocation: { country: { isoCode: "FR" } } });
                componentFixture.detectChanges();

                // Act
                await component.localBrokers$.pipe(take(1)).toPromise();

                // Assert
                expect(mockBrokerTeamHttpService.get).toHaveBeenCalledTimes(1);
                expect(mockBrokerTeamHttpService.get).toHaveBeenCalledWith(CountryService.eeaCountryIsoCodes);
            });

            it("should not get broker teams when insured location country ISO code is not EEA or Canada", async () => {
                // Arrange
                mockQuoteService.quote = of(<Quote>{ insuredLocation: { country: { isoCode: "UK" } } });
                componentFixture.detectChanges();

                // Act
                await component.localBrokers$.pipe(take(1)).toPromise();

                // Assert
                expect(mockBrokerTeamHttpService.get).toHaveBeenCalledTimes(0);
            });

            it("should return broker teams when insured location country ISO code is EEA or Canada", async () => {
                // Arrange
                const expectedLocalBrokers = [<BrokerTeam>{ id: 1 }, <BrokerTeam>{ id: 2 }]

                mockQuoteService.quote = of(<Quote>{ insuredLocation: { country: { isoCode: "CA" } } });
                mockBrokerTeamHttpService.get = () => of(expectedLocalBrokers);
                componentFixture.detectChanges();

                // Act
                const localBrokers = await component.localBrokers$.pipe(take(1)).toPromise();

                // Assert
                expect(localBrokers).toBe(expectedLocalBrokers);
            });
        });

        describe("subscribeToInsuredLocationChange", () => {
            it("should reset local broker when insured location license region changes from Canada to EEA", () => {
                // Arrange
                const quoteSubject = new BehaviorSubject<Quote>(<Quote>{ insuredLocation: { country: { isoCode: "CA" } } });

                mockQuoteService.quote = quoteSubject;
                componentFixture.detectChanges();

                // Act
                quoteSubject.next(<Quote>{ insuredLocation: { country: { isoCode: "FR" } } });

                // Assert
                expect(component.formControl.value).toBe(null);
            });

            it("should reset local broker when insured location license region changes from EEA to Canada", () => {
                // Arrange
                const quoteSubject = new BehaviorSubject<Quote>(<Quote>{ insuredLocation: { country: { isoCode: "FR" } } });

                mockQuoteService.quote = quoteSubject;
                componentFixture.detectChanges();

                // Act
                quoteSubject.next(<Quote>{ insuredLocation: { country: { isoCode: "CA" } } });

                // Assert
                expect(component.formControl.value).toBe(null);
            });

            it("should reset local broker when insured location license region changes from Canada to no region", () => {
                // Arrange
                const quoteSubject = new BehaviorSubject<Quote>(<Quote>{ insuredLocation: { country: { isoCode: "CA" } } });

                mockQuoteService.quote = quoteSubject;
                componentFixture.detectChanges();

                // Act
                quoteSubject.next(<Quote>{ insuredLocation: { country: { isoCode: "UK" } } });

                // Assert
                expect(component.formControl.value).toBe(null);
            });

            it("should reset local broker when insured location license region changes from EEA to no region", () => {
                // Arrange
                const quoteSubject = new BehaviorSubject<Quote>(<Quote>{ insuredLocation: { country: { isoCode: "FR" } } });

                mockQuoteService.quote = quoteSubject;
                componentFixture.detectChanges();

                // Act
                quoteSubject.next(<Quote>{ insuredLocation: { country: { isoCode: "UK" } } });

                // Assert
                expect(component.formControl.value).toBe(null);
            });

            it("should not reset local broker when insured location license region does not change", () => {
                // Arrange
                const quoteSubject = new BehaviorSubject<Quote>(<Quote>{ insuredLocation: { country: { isoCode: "FR" } } });
                const expectedBrokerTeam = <BrokerTeam>{ id: 3 };

                component.formControl.setValue(expectedBrokerTeam);
                mockQuoteService.quote = quoteSubject;
                componentFixture.detectChanges();

                // Act
                quoteSubject.next(<Quote>{ insuredLocation: { country: { isoCode: "BE" } } });

                // Assert
                expect(component.formControl.value).toBe(expectedBrokerTeam);
            });
        });
    });

    describe("writeValue", () => {
        let component: LocalBrokersComponent;

        beforeEach(async () => {
            const { instance } = await shallow.render();
            component = instance;
        });

        it("should write broker team to form control", () => {
            // Arrange
            const expectedBrokerTeam = <BrokerTeam>{ name: "a", broker: { companyName: "b", city: "c" } };

            // Act
            component.writeValue(expectedBrokerTeam);

            // Assert
            expect(component.formControl.value).toEqual(expectedBrokerTeam);
        });
    });

    describe("setDisabledState", () => {
        let component: LocalBrokersComponent;

        beforeEach(async () => {
            const { instance } = await shallow.render();
            component = instance;
        });

        it("should disable the form control", () => {
            // Act
            component.setDisabledState(true);

            // Assert
            expect(component.formControl.disabled).toBe(true);
        });

        it("should enable the form control", () => {
            // Act
            component.setDisabledState(false);

            // Assert
            expect(component.formControl.disabled).toBe(false);
        });
    });

    describe("validate", () => {
        let component: LocalBrokersComponent;

        beforeEach(async () => {
            const { instance } = await shallow.render();
            component = instance;
        });

        it("should return form control errors", () => {
            // Arrange
            const expectedErrors = { incorrect: true };
            component.formControl.setErrors(expectedErrors);

            // Act
            const errors = component.validate();

            // Assert
            expect(errors).toEqual(expectedErrors);
        });
    });

    describe("getName", () => {
        let component: LocalBrokersComponent;

        beforeEach(async () => {
            const { instance } = await shallow.render();
            component = instance;
        });

        it("should return the formatted broker team name", () => {
            // Arrange
            const brokerTeam = <BrokerTeam>{ name: "a", broker: { companyName: "b", city: "c" } };
            const expectedName = `${brokerTeam.broker.companyName} (${brokerTeam.broker.city}, ${brokerTeam.name})`;

            // Act
            const name = component.getName(brokerTeam);

            // Assert
            expect(name).toEqual(expectedName);
        });

        it("should return an empty string if the broker team is null", () => {
            // Act
            const name = component.getName(null);

            // Assert
            expect(name).toEqual("");
        });
    });
});

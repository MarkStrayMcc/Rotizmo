import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ClientLocation, DropDownItem } from "@app/models";
import { QuoteModule } from "@app/quote/quote.module";
import { DropdownService } from "@app/services/dropdown.service";
import { of } from "rxjs";
import { first } from "rxjs/operators";
import { Shallow } from "shallow-render";
import { InsuredAddressComponent } from "./insured-address.component";
import { InsuredAddressService } from "./insured-address.service";

describe("InsuredAddressComponent", () => {
    let shallow: Shallow<InsuredAddressComponent>;

    beforeEach(() => {
        shallow = new Shallow(InsuredAddressComponent, QuoteModule)
            .mock(DropdownService, { getCountries: () => of([]), getCountryStates: () => of([]) })
            .mock(InsuredAddressService, { insuredAddresses$: of([]) });
    });

    describe("constructor", () => {
        let component: InsuredAddressComponent;

        beforeEach(async () => {
            const { instance } = await shallow.render({ detectChanges: false });
            component = instance;
        });

        it("should create component", () => {
            expect(component).toBeDefined();
        });

        it("should create an empty form group and controls", () => {
            expect(component.formGroup.controls.address1).toBeDefined();
            expect(component.formGroup.controls.address2).toBeDefined();
            expect(component.formGroup.controls.address3).toBeDefined();
            expect(component.formGroup.controls.city).toBeDefined();
            expect(component.formGroup.controls.clientLocationId).toBeDefined();
            expect(component.formGroup.controls.countryId).toBeDefined();
            expect(component.formGroup.controls.county).toBeDefined();
            expect(component.formGroup.controls.postcode).toBeDefined();
            expect(component.formGroup.controls.stateProvinceCode).toBeDefined();
        });
    });

    describe("ngOnInit", () => {
        let component: InsuredAddressComponent;
        let componentFixture: ComponentFixture<InsuredAddressComponent>;
        
        let mockDropdownService: DropdownService;

        beforeEach(async () => {
            const { instance, fixture } = await shallow.render({ detectChanges: false });

            component = instance;
            componentFixture = fixture;

            mockDropdownService = TestBed.inject(DropdownService);
        });

        describe("isReadonly$", () => {
            beforeEach(() => {
                componentFixture.detectChanges();
            });

            it("should be false if no client location is selected", async () => {
                // Arrange
                component.formGroup.controls.clientLocationId.setValue(null);

                // Act
                const isReadonly = await component.isReadonly$.pipe(first()).toPromise();
    
                // Assert
                expect(isReadonly).toBe(false);
            });

            it("should be true if a client location is selected", async () => {
                // Arrange
                component.formGroup.controls.clientLocationId.setValue(7);

                // Act
                const isReadonly = await component.isReadonly$.pipe(first()).toPromise();
    
                // Assert
                expect(isReadonly).toBe(true);
            });
        });

        describe("countries$", () => {
            const expectedCountry = <DropDownItem>{ value: 9, hidden: "CA" };
            const expectedCountries = [expectedCountry, <DropDownItem>{ value: 5, hidden: "US" }];

            beforeEach(() => {
                mockDropdownService.getCountries = jasmine.createSpy().and.returnValue(of(expectedCountries));
            });

            it("should get countries", async () => {
                // Arrange
                componentFixture.detectChanges();

                // Act
                const countries = await component.countries$.pipe(first()).toPromise();
    
                // Assert
                expect(countries).toEqual(expectedCountries);
                expect(mockDropdownService.getCountries).toHaveBeenCalledTimes(1);
            });

            describe("subscribeToCountryChange", () => {
                beforeEach(() => {
                    componentFixture.detectChanges();
                });

                it("should set country control value", () => {
                    // Act
                    component.formGroup.controls.countryId.setValue(expectedCountry.value);
        
                    // Assert
                    expect(component.countryControl.value).toEqual(expectedCountry);
                });

                it("should emit country selected", () => {
                    // Act
                    component.formGroup.controls.countryId.setValue(expectedCountry.value);
        
                    // Assert
                    expect(component.countrySelected.emit).toHaveBeenCalledTimes(1);
                    expect(component.countrySelected.emit).toHaveBeenCalledWith(expectedCountry.hidden);
                });
            });

            describe("states$", () => {
                const expectedState = <DropDownItem>{ value: 2, hidden: "NY" };
                const expectedStates = [expectedState, <DropDownItem>{ value: 7, hidden: "AK" }];

                beforeEach(() => {
                    mockDropdownService.getCountryStates = jasmine.createSpy().and.returnValue(of(expectedStates));
                });

                it("should get states by country code when the country changes", async () => {
                    // Arrange
                    componentFixture.detectChanges();
                    component.formGroup.controls.countryId.setValue(expectedCountry.value);
    
                    // Act
                    const states = await component.states$.pipe(first()).toPromise();
        
                    // Assert
                    expect(states).toEqual(expectedStates);
                    expect(mockDropdownService.getCountryStates).toHaveBeenCalledTimes(1);
                    expect(mockDropdownService.getCountryStates).toHaveBeenCalledWith(expectedCountry.hidden);
                });

                it("should not get states when no country is selected", async () => {
                    // Arrange
                    componentFixture.detectChanges();
                    component.formGroup.controls.countryId.setValue(null);
    
                    // Act
                    const states = await component.states$.pipe(first()).toPromise();
        
                    // Assert
                    expect(states).toEqual([]);
                    expect(mockDropdownService.getCountryStates).toHaveBeenCalledTimes(0);
                });

                describe("subscribeToStateProvinceCodeChange", () => {
                    beforeEach(() => {
                        componentFixture.detectChanges();
                        component.formGroup.controls.countryId.setValue(expectedCountry.value);
                    });
    
                    it("should set state control value", () => {
                        // Act
                        component.formGroup.controls.stateProvinceCode.setValue(expectedState.value);
            
                        // Assert
                        expect(component.stateControl.value).toEqual(expectedState);
                    });
                });

                describe("isStateVisible$", () => {
                    it("should get states by country code when the country changes", async () => {
                        // Arrange
                        mockDropdownService.getCountryStates = jasmine.createSpy().and.returnValue(of([expectedStates]));
                        componentFixture.detectChanges();
                        component.formGroup.controls.countryId.setValue(expectedCountry.value);
    
                        // Act
                        const isStateVisible = await component.isStateVisible$.pipe(first()).toPromise();
            
                        // Assert
                        expect(isStateVisible).toBe(true);
                    });
    
                    it("should not get states when no country is selected", async () => {
                        // Arrange
                        mockDropdownService.getCountryStates = jasmine.createSpy().and.returnValue(of([]));
                        componentFixture.detectChanges();
                        component.formGroup.controls.countryId.setValue(expectedCountry.value);
        
                        // Act
                        const isStateVisible = await component.isStateVisible$.pipe(first()).toPromise();
            
                        // Assert
                        expect(isStateVisible).toBe(false);
                    });

                    describe("subscribeToIsStateVisibleChange", () => {
                        beforeEach(() => {
                            mockDropdownService.getCountryStates = jasmine.createSpy().and.returnValue(of([expectedStates]));
                            componentFixture.detectChanges();
                        });

                        it("should enable state control when is visible is true", () => {
                            // Arrange
                            const enableSpy = spyOn(component.formGroup.controls.stateProvinceCode, "enable");

                            // Act
                            component.formGroup.controls.countryId.setValue(expectedCountry.value);
                
                            // Assert
                            expect(enableSpy).toHaveBeenCalledTimes(1);
                        });

                        it("should disable state control when is visible is true", () => {
                            // Arrange
                            const disableSpy = spyOn(component.formGroup.controls.stateProvinceCode, "disable");

                            // Act
                            component.formGroup.controls.countryId.setValue(null);
                
                            // Assert
                            expect(disableSpy).toHaveBeenCalledTimes(1);
                        });
                    });
                });
            });
        });
    });

    describe("initialised", () => {
        let component: InsuredAddressComponent;

        beforeEach(async () => {
            const { instance } = await shallow.render();
            component = instance;
        });

        const generateDefaultInsuredAddress = () => {
            return <ClientLocation> {
                address1: "Test Address 1",
                address2: "Test Address 2",
                address3: "Test Address 3",
                city: "Test City",
                clientLocationId: 10,
                countryId: 20,
                county: "Test County",
                postcode: "Test Postcode",
                stateProvinceCode: "GB"
            };
        };

        describe("writeValue", () => {
            it("should update the form values", () => {
                // Arrange
                const expectedInsuredAddress = generateDefaultInsuredAddress();
                delete expectedInsuredAddress.stateProvinceCode;
    
                // Act
                component.writeValue(expectedInsuredAddress);
    
                // Assert
                expect(component.formGroup.value).toEqual(expectedInsuredAddress);
            });
        });
    
        describe("setDisabledState", () => {
            it("should disable the form group and controls when true", () => {
                // Arrange
                const disableSpy = spyOn(component.formGroup, "disable");
                
                // Act
                component.setDisabledState(true);
    
                // Assert
                expect(disableSpy).toHaveBeenCalledTimes(1);
            });
    
            it("should enable the form group and controls when false", () => {
                // Arrange
                const enableSpy = spyOn(component.formGroup, "enable");
                
                // Act
                component.setDisabledState(false);
    
                // Assert
                expect(enableSpy).toHaveBeenCalledTimes(1);
            });
        });
    
        describe("onCountrySelected", () => {
            it("should update the countryId", () => {
                // Arrange
                const expectedCountryId = 4;
    
                // Act
                component.onCountrySelected(<DropDownItem>{ value: expectedCountryId });
    
                // Assert
                expect(component.formGroup.controls.countryId.value).toBe(expectedCountryId);
            });
    
            it("should reset the stateProvinceCode", () => {
                // Act
                component.onCountrySelected(<DropDownItem>{ value: 3 });
    
                // Assert
                expect(component.formGroup.controls.stateProvinceCode.value).toBeNull();
            });
    
            it("should not update the countryId if it has not changed", () => {
                // Arrange
                component.formGroup.patchValue({ countryId: 5 });
                const setValueSpy = spyOn(component.formGroup.controls.countryId, "setValue");
    
                // Act
                component.onCountrySelected(<DropDownItem>{ value: 5 });

                // Assert
                expect(setValueSpy).toHaveBeenCalledTimes(0);
            });
    
            it("should not reset the stateProvinceCode if the countryId has not changed", () => {
                // Arrange
                const expectedStateProvinceCode = 9;
                component.formGroup.patchValue({ countryId: 5, stateProvinceCode: expectedStateProvinceCode });
    
                // Act
                component.onCountrySelected(<DropDownItem>{ value: 5 });
    
                // Assert
                expect(component.formGroup.controls.stateProvinceCode.value).toBe(expectedStateProvinceCode);
            });
        });
    
        describe("onStateSelected", () => {
            it("should set the stateProvinceCode", () => {
                // Arrange
                const expectedStateProvinceCode = "NY";
    
                // Act
                component.onStateSelected(<DropDownItem>{ value: expectedStateProvinceCode });
    
                // Assert
                expect(component.formGroup.controls.stateProvinceCode.value).toBe(expectedStateProvinceCode);
            });
    
            it("should not update the stateProvinceCode if it has not changed", () => {
                // Arrange
                component.formGroup.patchValue({ stateProvinceCode: "NY" });
                const setValueSpy = spyOn(component.formGroup.controls.stateProvinceCode, "setValue");
    
                // Act
                component.onStateSelected(<DropDownItem>{ value: "NY" });

                // Assert
                expect(setValueSpy).toHaveBeenCalledTimes(0);
            });
        });
    
        describe("reset", () => {
            it("should reset the form values", () => {
                // Arrange
                const insuredAddress = generateDefaultInsuredAddress();
                component.formGroup.setValue(insuredAddress);
    
                // Act
                component.reset();
    
                // Assert
                expect(component.formGroup.controls.address1.value).toBeNull();
                expect(component.formGroup.controls.address2.value).toBeNull();
                expect(component.formGroup.controls.address3.value).toBeNull();
                expect(component.formGroup.controls.city.value).toBeNull();
                expect(component.formGroup.controls.clientLocationId.value).toBe(0);
                expect(component.formGroup.controls.countryId.value).toBeNull();
                expect(component.formGroup.controls.county.value).toBeNull();
                expect(component.formGroup.controls.postcode.value).toBeNull();
                expect(component.formGroup.controls.stateProvinceCode.value).toBeNull();
            });
        });
    });
});

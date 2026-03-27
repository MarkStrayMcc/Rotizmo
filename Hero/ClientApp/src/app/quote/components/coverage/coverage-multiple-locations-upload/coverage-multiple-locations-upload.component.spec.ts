import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CoverageMultipleLocationsUploadComponent } from "./coverage-multiple-locations-upload.component";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { QuoteService } from "@app/quote/services/quote.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { MockModalDialogService } from "@app/quote/quote.component.mock";
import { UserService } from "@app/services/user.service";
import { By } from "@angular/platform-browser";
import { of } from "rxjs";
import { LimitBasis } from "@app/enums/LimitBasis";
import { PropertyLimitConfig } from "@app/quote/models/PropertyLimitConfig";

describe("CoverageMultipleLocationsUploadComponent", () => {
	let component: CoverageMultipleLocationsUploadComponent;
	let fixture: ComponentFixture<CoverageMultipleLocationsUploadComponent>;

	const mockedQuoteService = jasmine.createSpyObj('QuoteService', ['getCurrency', 'isSaved', 'getQuote', 'isUpdating', 'hasPropertyLimits']);
    const mockedUserService = jasmine.createSpyObj('UserService', ['isFeatureAccessible']);

    const firstLossLimit = 5000;
    const quoteReference = 123;
    const wordingVersionId = 42;
    const childCoverageLimit = {
        limit: firstLossLimit,
        limitBasis: LimitBasis.FirstLossLimit,
        coverageLimitType: {
            limitTypeCode: PropertyLimitConfig.TotalInsuredLimitCode,
        },
    }

    const coverages = [{
        childCoverages: [{
            limits: [childCoverageLimit],
            }],
        }
    ];

    const quote = {
        quoteReference,
        wordingVersionId,
        coverages,
    };

	 beforeEach(() => {
	 	TestBed.configureTestingModule({
	 		providers: [
	 			NavigationOverrideService,
	 			{ provide: QuoteService, useValue: mockedQuoteService},
	 			{ provide: ModalDialogService, useClass: MockModalDialogService },
                { provide: UserService, useValue: mockedUserService },
	 		],
            declarations: [CoverageMultipleLocationsUploadComponent],
	 	}).compileComponents();
	 });

    beforeEach(() => {
 		mockedQuoteService.isSaved.and.returnValue(false);
        mockedQuoteService.hasPropertyLimits.and.returnValue(false);
        mockedUserService.isFeatureAccessible.and.returnValue(true);
        mockedQuoteService.getQuote.and.returnValue(quote);
		fixture = TestBed.createComponent(CoverageMultipleLocationsUploadComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("Should create component", () => {
		expect(component).toBeTruthy();
	});

    describe ("showReplaceFileButton", () => {
        it("Should not show the replace file button when locations are not uploaded", () => {
            expect (component.showReplaceFileButton()).toBe(false);
        });

        it("Should show the replace file button when locations are uploaded but have not saved the quote", () => {
            mockedQuoteService.hasPropertyLimits.and.returnValue(true);

            expect (component.showReplaceFileButton()).toBe(true);
        });

        it ("Should show the replace file button when locations are uploaded, the quote is saved and has been updated", () => {
            mockedQuoteService.hasPropertyLimits.and.returnValue(true);
            mockedQuoteService.isSaved.and.returnValue(true);
            mockedQuoteService.isUpdating.and.returnValue(true);

            expect (component.showReplaceFileButton()).toBe(true);
        });

        it("Should not show the replace file button when locations are uploaded and the quote is saved but has not been updated", () => {
            mockedQuoteService.hasPropertyLimits.and.returnValue(true);
            mockedQuoteService.isSaved.and.returnValue(true);
            mockedQuoteService.isUpdating.and.returnValue(false);

            expect (component.showReplaceFileButton()).toBe(false);
        });
    });

    describe ("downloadEmptyTemplateLink", () => {
        it("Should show the download empty template link when locations are not uploaded", () => {
            expect (component.showDownloadEmptyTemplateLink()).toBe(true);
        });

        it("Should not show the download empty template link when locations are uploaded", () => {
            mockedQuoteService.hasPropertyLimits.and.returnValue(true);
        
            expect (component.showDownloadEmptyTemplateLink()).toBe(false);
        });
    });

    describe ("downloadLocationsLink", () => {
        it("Should not show the download locations link when the quote is saved", () => {
            expect (component.showDownloadLocationsButton()).toBe(false);
        });

        it("Should show the download locations link when the quote is saved", () => {
            mockedQuoteService.isSaved.and.returnValue(true);

            expect (component.showDownloadLocationsButton()).toBe(true);
        });
    });

    it("should open dialog when the Add Location button is clicked", () => {
		// Arrange
		fixture.detectChanges();
		const addLocationsButton = fixture.debugElement.query(By.css("#addLocationsButton"));
		const openDialogSpy = spyOn<any>(component.modalDialogService, "openDialog");

        // Act
		addLocationsButton.triggerEventHandler("click", null);

        // Assert
		expect(openDialogSpy.calls.mostRecent().args[1].panelClass).toBe("modalMultiplePropertyUpload");
	});

	it("should open dialog when openMultiplePropertyModal function called", () => {
		// Arrange
		fixture.detectChanges();
		const openDialogSpy = spyOn<any>(component.modalDialogService, "openDialog");

        // Act
		component.openMultiplePropertyModal();

        // Assert
		expect(openDialogSpy.calls.mostRecent().args[1].panelClass).toBe("modalMultiplePropertyUpload");
	});

    it("should pass binder section ID to modal setup callback", () => {
        // Arrange
        component.binderSectionId = 1289;
        const openDialogSpy = spyOn<any>(component.modalDialogService, "openDialog");

        // Act
        component.openMultiplePropertyModal();
        const setupModal = openDialogSpy.calls.mostRecent().args[2] as (modal: any) => void;
        const modalInstance: any = {};
        setupModal(modalInstance);

        // Assert
        expect(modalInstance.binderSectionId).toBe(1289);
    });

	it("should display Add Locations button when quote is NOT saved and has NO property limits", () => {
		// Arrange
		fixture.detectChanges();

        // Act
		const addLocationsButton = fixture.debugElement.query(By.css("#addLocationsButton"));

        // Assert
		expect(addLocationsButton).toBeTruthy();
	});

	it("should NOT display Add Locations button when Quote is saved", () => {
		// Arrange
		mockedQuoteService.isSaved.and.returnValue(true);
		fixture.detectChanges();

        // Act
		const addLocationsButton = fixture.debugElement.query(By.css("#addLocationsButton"));

        // Assert
		expect(addLocationsButton).toBeFalsy();
	});

	it("should NOT display Add Locations button when quote has property limits", () => {
		// Arrange
		mockedQuoteService.hasPropertyLimits.and.returnValue(true);
		fixture.detectChanges();

        // Act
		const addLocationsButton = fixture.debugElement.query(By.css("#addLocationsButton"));

        // Assert
		expect(addLocationsButton).toBeFalsy();
	});

	it("should display Download Locations button when Quote is saved", () => {
		// Arrange
		mockedQuoteService.isSaved.and.returnValue(true);
		fixture.detectChanges();

        // Act
		const downloadLocationsLink = fixture.debugElement.query(By.css("#downloadLocationsLink"));

        // Assert
		expect(downloadLocationsLink).toBeTruthy();
	});

	it("should NOT display Download Locations button when Quote is NOT saved", () => {
		// Arrange
		fixture.detectChanges();

        // Act
		const downloadLocationsLink = fixture.debugElement.query(By.css("#downloadLocationsLink"));

        // Assert
		expect(downloadLocationsLink).toBeFalsy();
    });

    it("should display Replace Locations button when quote is being updated", () => {
        // Arrange
        mockedQuoteService.isSaved.and.returnValue(true);
        mockedQuoteService.isUpdating.and.returnValue(true);
        fixture.detectChanges();

        // Act
        const replaceFileButton = fixture.debugElement.query(By.css("#replaceFileButton"));

        // Assert
        expect(replaceFileButton).toBeTruthy();
    });

	it("should display Replace Locations button when quote is NOT saved and has property limits", () => {
        // Arrange
        mockedQuoteService.hasPropertyLimits.and.returnValue(true);
        fixture.detectChanges();

        // Act
        const replaceFileButton = fixture.debugElement.query(By.css("#replaceFileButton"));

        // Assert
        expect(replaceFileButton).toBeTruthy();
    });

    it("should NOT display Replace Locations button when quote is saved but NOT in updated state", () => {
        // Arrange
        mockedQuoteService.isSaved.and.returnValue(true);
        mockedQuoteService.isUpdating.and.returnValue(false);
        fixture.detectChanges();

        // Act
        const replaceFileButton = fixture.debugElement.query(By.css("#replaceFileButton"));

        // Assert
        expect(replaceFileButton).toBeFalsy();
    });

	it("should trigger navigation when Download Locations button is clicked", () => {
		// Arrange
		mockedQuoteService.isSaved.and.returnValue(true);
		let navigationOverrideService = TestBed.inject(NavigationOverrideService);
		fixture.detectChanges();
		const downloadLocationsLink = fixture.debugElement.query(By.css("#downloadLocationsLink"));
		window.onbeforeunload = jasmine.createSpy();

        // Act
		downloadLocationsLink.triggerEventHandler("click", null);

        // Assert
		expect(navigationOverrideService.allowNavigation).toBeTruthy();
	});

	it("should not show the Add Locations button when the business line and product code do not match the multiple property configuration", () => {
		// Arrange
        component.isMultiplePropertyBusinessLineProduct$ = of(false);
		fixture.detectChanges();

        // Act
		const addLocationsButton = fixture.debugElement.query(By.css("#addLocationsButton"));

        // Assert
		expect(addLocationsButton).toBeFalsy();
	});

	it("should show the Add Locations button when the business line and product code match the multiple property configuration", () => {
		// Act
		const addLocationsButton = fixture.debugElement.query(By.css("#addLocationsButton"));

        // Assert
		expect(addLocationsButton).toBeTruthy();
	});

    describe('getDownloadLocationsUrl', () => {
        it('should return the correct URL with firstLossLimit when limitBasis is FirstLossLimit', () => {
            childCoverageLimit.limitBasis = LimitBasis.FirstLossLimit;
            quote.coverages = coverages;

            const url = component.getDownloadLocationsUrl();

            expect(url).toContain(`/templates/download/${wordingVersionId}?`);
            expect(url).toContain(`quoteRef=${quoteReference}`);
            expect(url).toContain(`firstLossLimit=${firstLossLimit}`);
        });

        it('should return the correct URL with firstLossLimit as 0 if coverages is falsy', () => {
            quote.coverages = null;

            const url = component.getDownloadLocationsUrl();

            expect(url).toContain(`/templates/download/${wordingVersionId}?`);
            expect(url).toContain(`quoteRef=${quoteReference}`);
            expect(url).toContain('firstLossLimit=0');
        });

        it('should return the correct URL without firstLossLimit if coverages is empty', () => {
            quote.coverages = [];

            const url = component.getDownloadLocationsUrl();

            expect(url).toContain(`/templates/download/${wordingVersionId}?`);
            expect(url).toContain(`quoteRef=${quoteReference}`);
            expect(url).not.toContain('firstLossLimit');
        });

        it('should return the correct URL without firstLossLimit if limitBasis is not FirstLossLimit', () => {
            childCoverageLimit.limitBasis = LimitBasis.AmountInsured;
            quote.coverages = coverages;

            const url = component.getDownloadLocationsUrl();

            expect(url).toContain(`/templates/download/${wordingVersionId}?`);
            expect(url).toContain(`quoteRef=${quoteReference}`);
            expect(url).not.toContain('firstLossLimit');
        });
    });

    describe('getTemplateUrl', () => {
        it('should return the correct URL', () => {
            const url = component.getTemplateUrl();

            expect(url).toEqual(`/templates/property/${wordingVersionId}`);
        });
    });
});

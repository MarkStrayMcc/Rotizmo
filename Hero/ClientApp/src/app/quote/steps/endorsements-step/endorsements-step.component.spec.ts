/* tslint:disable:max-classes-per-file */
import { Component, DebugElement, EventEmitter, forwardRef, Injectable, Input, Output, SimpleChange } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Constants } from "@app/constants/constants";
import { MaterialModule } from "@app/material/material.module";
import { InsuranceBasis, Document, LossPayee, Quote, RiskQuestion, RiskQuestionAnswer, OriginSystem, FeatureAccess } from "@app/models";
import { AdditionalInsured } from "@app/models/auto-generated/AdditionalInsured";
import { SearchableDropdownComponent } from "@app/quote/components/risk/searchable-dropdown/searchable-dropdown.component";
import { DocumentScopePipe } from "@app/quote/pipes/document-scope.pipe";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { EndorsementService } from "@app/quote/services/endorsements/endorsement.service";
import { EndorsementsStepComponent } from "@app/quote/steps/endorsements-step/endorsements-step.component";
import { CoverageService } from "@app/services/coverage.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { PreviewDocumentModalService } from "@app/services/preview-document-modal.service";
import { RiskService } from "@app/services/risk-service";
import { UserService } from "@app/services/user.service";
import { ErrorModule } from "@app/shared/error.module";
import { FormCreatorModule } from "@app/shared/form-creator/form-creator.module";
import { SharedModule } from "@app/shared/shared.module";
import { getTestQuote } from "@test-helpers/index";
import { from, Observable, of } from "rxjs";
import { LanguageService } from "../../services/language.service";
import { MultiplePropertyComponent } from "./modals/multiple-property/multiple-property.component";
import { PropertyLimitsValidator } from "./modals/multiple-property/property-limit/property-limits-validator";
import { Language } from "@app/quote/models/Language";
import { FeaturesHttpService } from "@app/services/features-http.service";

let fixture: ComponentFixture<EndorsementsStepComponent>;
let component: EndorsementsStepComponent;
let endorsementsStep: EndorsementStep;
let endorsementsHttpService;

describe("endorsements-step component", () => {
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EndorsementsStepComponent, DocumentScopePipe, MockRiskPanelComponent, SearchableDropdownComponent, MockQuoteAdditionalInsuredComponent],
			imports: [BrowserAnimationsModule, ReactiveFormsModule, MaterialModule, SharedModule, ErrorModule, FormCreatorModule],
			providers: [
				PreviewDocumentModalService,
				MessageService,
				{ provide: RiskService, useClass: MockRiskService },
				{ provide: ModalDialogService, useClass: MockModalDialogService },
				{ provide: EndorsementService, useClass: MockEndorsementService },
				{ provide: LanguageService, useClass: MockLanguageService },
				{ provide: CoverageService, useClass: MockCoverageService },
				{ provide: FeaturesHttpService, useClass: MockFeaturesHttpService },
				{
					provide: PropertyLimitsValidator,
					useClass: MockPropertyLimitService,
				},
			],
		}).compileComponents();
	}));

	beforeEach(async(() => {
		createComponent();
	}));

	it("we should have a list of available endorsements inc bespoke minus the auto-attached endorsements", async(() => {
		expect(endorsementsStep.getAvailableEndorsementsSpy).toHaveBeenCalled();
		expect(endorsementsStep.getAvailableEndorsementsSpy.calls.mostRecent().args[0].wordingVersionId).toBe(3);

		expect(endorsementsStep.getAutoAttachingEndorsementsSpy).toHaveBeenCalled();
		expect(endorsementsStep.getAvailableEndorsementsSpy.calls.mostRecent().args[0].wordingVersionId).toBe(3);

		expect(component.availableEndorsements.length).toBe(4);
		expect(component.vm.endorsements.length).toBe(2);
	}));

	it("Should set the available tags based on auto-attached endorsements on load", async(() => {
		// Assemble - see setup
		// Act - see setup

		// Assert
		expect(component.availableTags.size).toBe(2);
		expect(component.availableTags.has("one")).toBeTruthy();
		expect(component.availableTags.has("two")).toBeTruthy();
	}));

	it("Should set the all tags based on all available and attached endorsements on load", async(() => {
		// Assemble - see setup
		// Act - see setup

		// Assert
		expect(component.allTags.size).toBe(4);
		expect(component.allTags.has("one")).toBeTruthy("missing one");
		expect(component.allTags.has("two")).toBeTruthy("missing two");
		expect(component.allTags.has("three")).toBeTruthy("missing three");
		expect(component.allTags.has("four")).toBeTruthy("missing four");
	}));

	it("Should update the available tags when adding an endorsement", async(() => {
		// Assemble
		expect(endorsementsStep.getAvailableEndorsementsSpy).toHaveBeenCalled();

		const control = component.stepForm.get("selectedValue");
		const endorsement = new Document();
		endorsement.documentId = 5;
		endorsement.reference = "5";
		endorsement.riskQuestionTags = ["one", "five"];
		endorsement.title = "PREMIUM PAYMENT ENDORSEMENT";
		control.setValue(endorsement);

		// Act
		component.addEndorsement();

		// Assert
		expect(component.availableTags.size).toBe(3);
		expect(component.availableTags.has("five")).toBeTruthy();
	}));

	it("Should not update the available tags when adding an endorsement if it is a bespoke", async(() => {
		// Assemble
		expect(endorsementsStep.getAvailableEndorsementsSpy).toHaveBeenCalled();

		const control = component.stepForm.get("selectedValue");
		const endorsement = Constants.bespokeEndorsement;
		control.setValue(endorsement);

		// Act
		component.addEndorsement();

		// Assert
		expect(component.availableTags.size).toBe(2);
		expect(component.availableTags.has("five")).toBeFalsy();
		expect(component.availableTags.has("one")).toBeTruthy();
		expect(component.availableTags.has("two")).toBeTruthy();
	}));

	it("Should update the available tags when removing an endorsement", async(() => {
		expect(endorsementsStep.getAvailableEndorsementsSpy).toHaveBeenCalled();

		expect(component.availableEndorsements.length).toBe(4);
		expect(component.vm.endorsements.length).toBe(2);
		const endorsementSix = component.vm.endorsements.filter((x) => x.documentId === 6);
		expect(endorsementSix.length).toBe(1);

		component.removeEndorsement(6);

		expect(component.availableTags.size).toBe(1);
		expect(component.availableTags.has("two")).toBeFalsy();
	}));

	it("Should call message service if not all available tags have risk questions", async(() => {
		// Assemble
		// only 1 of the tags has a risk question in setup
		const messageService = TestBed.inject(MessageService);
		const messageServiceSpy = spyOn(messageService, "sendMessage");

		// Act
		component.checkErrorsWithAvailableRiskQuestions();

		// Assert
		expect(messageServiceSpy).toHaveBeenCalled();
	}));

	it("quote has an endorsement after adding one and it is no longer available to select", async(() => {
		expect(endorsementsStep.getAvailableEndorsementsSpy).toHaveBeenCalled();

		const control = component.stepForm.get("selectedValue");
		const endorsement = new Document();
		endorsement.documentId = 5;
		endorsement.reference = "5";
		endorsement.title = "PREMIUM PAYMENT ENDORSEMENT";

		control.setValue(endorsement);
		component.addEndorsement();

		expect(component.vm.endorsements.length).toBe(3);
		expect(component.availableEndorsements.length).toBe(3);
	}));

	it("quote does not have the endorsement after removing it", async(() => {
		expect(endorsementsStep.getAvailableEndorsementsSpy).toHaveBeenCalled();

		expect(component.availableEndorsements.length).toBe(4);
		expect(component.vm.endorsements.length).toBe(2);
		let endorsementOnes = component.availableEndorsements.filter((x) => x.documentId === 3);
		expect(endorsementOnes.length).toBe(1);

		const control = component.stepForm.get("selectedValue");
		const endorsement = new Document();
		endorsement.documentId = 3;
		endorsement.reference = "3";
		endorsement.title = "USA AND CANADA JURISDICTION ENDORSEMENT";
		endorsement.riskQuestionTags = ["TEST_TAG"];

		control.setValue(endorsement);
		component.addEndorsement();

		expect(component.availableEndorsements.length).toBe(3);
		expect(component.vm.endorsements.length).toBe(3);
		endorsementOnes = component.availableEndorsements.filter((x) => x.documentId === 3);
		expect(endorsementOnes.length).toBe(0);

		component.removeEndorsement(3);

		expect(component.vm.endorsements.length).toBe(2);
		expect(component.availableEndorsements.length).toBe(4);
		endorsementOnes = component.availableEndorsements.filter((x) => x.documentId === 3);
		expect(endorsementOnes.length).toBe(1);
	}));

	it("risk question answers associated to an endorsement are removed from the VM when the endorsement is removed", () => {
		const testRQA1 = new RiskQuestionAnswer();
		testRQA1.id = 1;
		testRQA1.riskQuestionTag = "TEST_TAG";

		const testRQA2 = new RiskQuestionAnswer();
		testRQA2.id = 2;
		testRQA2.riskQuestionTag = "TEST_TAG";

		const testRQA3 = new RiskQuestionAnswer();
		testRQA3.id = 3;
		testRQA3.riskQuestionTag = "ANOTHER_TAG";

		component.vm.riskQuestionAnswers.push(testRQA1, testRQA2, testRQA3);
		expect(component.vm.riskQuestionAnswers.length).toBe(5); // there are already 2 questions in the mock quote

		const control = component.stepForm.get("selectedValue");

		const endorsement = new Document();
		endorsement.documentId = 5;
		endorsement.riskQuestionTags = ["TEST_TAG"];

		control.setValue(endorsement);
		component.addEndorsement();

		// Act
		component.removeEndorsement(endorsement.documentId);
		// Assert
		expect(component.vm.riskQuestionAnswers.length).toBe(3);
		expect(component.vm.riskQuestionAnswers.filter((rqa) => rqa.riskQuestionTag === "ANOTHER_TAG").length).toBe(1);
	});

	it("quote should keep the endorsement if there is a translation for it", async(() => {
		expect(endorsementsStep.getAvailableEndorsementsSpy).toHaveBeenCalled();

		const control = component.stepForm.get("selectedValue");
		const endorsement = new Document();
		endorsement.documentId = 5;
		endorsement.reference = "5";
		endorsement.title = "PREMIUM PAYMENT ENDORSEMENT";
		control.setValue(endorsement);

		// act
		component.addEndorsement();

		// assert
		expect(component.vm.endorsements.length).toBe(3);
		expect(component.availableEndorsements.length).toBe(3);
		endorsementsStep.getAvailableEndorsementsSpy.calls.first().returnValue.subscribe((x) => (component.availableEndorsements = x));

		expect(component.availableEndorsements.length).toBe(6);
		component.filterEndorsements();
		expect(component.vm.endorsements.length).toBe(3);
		expect(+component.vm.endorsements[0].reference).toBe(1);
	}));

	it("should display multiple property modal for multiple property clauses", () => {
		// Arrange
		const modalDialogService = TestBed.inject(ModalDialogService);
		const modalDialogServiceSpy = spyOn(modalDialogService, "openDialog");
		const control = component.stepForm.controls.selectedValue;

		Constants.getMultiplePropertyEndorsementReferences().forEach((reference) => {
			control.setValue({ documentId: 1, reference });
			modalDialogServiceSpy.calls.reset();

			// Act
			component.addEndorsement();

			// Assert
			expect(modalDialogServiceSpy).toHaveBeenCalledTimes(1);
			expect(modalDialogServiceSpy).toHaveBeenCalledWith(
				MultiplePropertyComponent,
				ModalConfig.multiplePropertyModal.matDialogConfig,
				jasmine.any(Function),
				jasmine.any(Function)
			);
		});
	});

	it("should display additional insured modal for additional insured clauses", async(() => {
		// Arrange
		const additionalInsuredTestCases = ["2134", "1982", "2624", "2289"];
		const modalDialogService = fixture.debugElement.injector.get(ModalDialogService);
		const modalDialogServiceSpy = spyOn(modalDialogService, "openDialog");
		const endorsement = new Document();
		endorsement.documentId = 1;
		const control = component.stepForm.get("selectedValue");

		additionalInsuredTestCases.forEach((clauseNumber) => {
			endorsement.reference = clauseNumber;
			control.setValue(endorsement);
			modalDialogServiceSpy.calls.reset();

			// Act
			component.addEndorsement();

			// Assert
			expect(modalDialogServiceSpy).toHaveBeenCalled();
			expect(modalDialogServiceSpy.calls.mostRecent().args[0].toString()).toContain("QuoteAdditionalInsuredComponent");
		});
	}));

	it("should remove additional insured from quote object when additional insured clause is removed", async(() => {
		// Arrange
		const additionalInsuredTestCases = ["2134", "1982", "2624", "2289"];

		additionalInsuredTestCases.forEach((clauseNumber) => {
			component.vm.autoAttachedEndorsements = [];
			component.availableEndorsements = [];

			const endorsement = new Document();
			endorsement.documentId = 10;
			endorsement.riskQuestionTags = [];
			endorsement.reference = clauseNumber;

			component.vm.endorsements.push(endorsement);
			component.vm.additionalInsureds = [{ entityName: "entity 1" }, { entityName: "entity 2" }] as AdditionalInsured[];

			// Act
			component.removeEndorsement(endorsement.documentId);

			// Assert
			expect(component.vm.additionalInsureds).toEqual([]);
		});
	}));

	it("should display loss payee modal for loss payee clause", async(() => {
		// Arrange
		const lossPayeeTestCases = ["224", "2129", "2266", "2613"];
		let modalDialogService = fixture.debugElement.injector.get(ModalDialogService);
		const modalDialogServiceSpy = spyOn(modalDialogService, "openDialog");
		const control = component.stepForm.get("selectedValue");
		const endorsement = new Document();
		endorsement.documentId = 1;

		lossPayeeTestCases.forEach((clauseNumber) => {
			endorsement.reference = clauseNumber;
			control.setValue(endorsement);
			modalDialogServiceSpy.calls.reset();

			// Act
			component.addEndorsement();

			// Assert
			expect(modalDialogServiceSpy).toHaveBeenCalled();
			expect(modalDialogServiceSpy.calls.mostRecent().args[0].toString()).toContain("QuoteLossPayeeComponent");
		});
	}));

	it("should remove loss payee from quote object when loss payee clause is removed", async(() => {
		// Arrange
		const lossPayeeTestCases = ["224", "2129", "2266", "2613"];

		lossPayeeTestCases.forEach((clauseNumber) => {
			component.vm.autoAttachedEndorsements = [];
			component.availableEndorsements = [];

			const endorsement = new Document();
			endorsement.documentId = 10;
			endorsement.reference = clauseNumber;
			endorsement.riskQuestionTags = [];

			component.vm.endorsements.push(endorsement);
			component.vm.lossPayees = [{ entityName: "entity 1" }, { entityName: "entity 2" }] as LossPayee[];

			// Act
			component.removeEndorsement(endorsement.documentId);

			// Assert
			expect(component.vm.lossPayees).toEqual([]);
		});
	}));

	it("should call the getAvailableEndorsments with riskQuestionAnswers", async(() => {
		// Arrange
		let expected = {
			productCode: "Management Liability",
			countryCode: "GB",
			stateCode: "",
			brokerTeamId: 1,
			brokerId: 1,
			brokerGroupId: 123,
			businessLineCodes: [],
			insuringClauseCodes: [],
			insuringClauseSectionCodes: [],
			activityCodes: [],
			languageCode: "en",
			wordingVersionId: 3,
			riskQuestionAnswers: {
				TOTAL_REVENUE: "10000000",
				GST_Registered: "No",
			},
			documentBasisType: InsuranceBasis.Primary,
			originSystem: OriginSystem.Hero,
            coverHolder: "CFC Underwriting"
		};

		//Assert
		expect(endorsementsStep.getAvailableEndorsementsSpy).toHaveBeenCalledWith(expected);
	}));

	it("should call the getAutoAttachingEndorsements with riskQuestionAnswers", async(() => {
		// Arrange
		let expected = {
			productCode: "Management Liability",
			countryCode: "GB",
			stateCode: "",
			brokerTeamId: 1,
			brokerId: 1,
			brokerGroupId: 123,
			businessLineCodes: [],
			insuringClauseCodes: [],
			insuringClauseSectionCodes: [],
			activityCodes: [],
			hasSubjectivities: false,
			languageCode: "en",
			wordingVersionId: 3,
			riskQuestionAnswers: {
				TOTAL_REVENUE: "10000000",
				GST_Registered: "No",
			},
			documentBasisType: InsuranceBasis.Primary,
			originSystem: OriginSystem.Hero,
			coverHolder: "CFC Underwriting"
		};

		//Assert
		expect(endorsementsStep.getAutoAttachingEndorsementsSpy).toHaveBeenCalledWith(expected);
	}));
});

function createComponent() {
	fixture = TestBed.createComponent(EndorsementsStepComponent);
	component = fixture.componentInstance;
	component.vm = getTestQuote();
	// so that risk questions get handled as changes

	endorsementsStep = new EndorsementStep();

	// 1st change detection triggers ngOnInit
	fixture.detectChanges();
	endorsementsStep.addPageElements();
	return fixture.whenStable().then(() => {
		component.ngOnChanges({
			vm: new SimpleChange(null, component.vm, true),
		});
		fixture.detectChanges();
		endorsementsStep.addPageElements();
	});
}

class EndorsementStep {
	public getAvailableEndorsementsSpy: jasmine.Spy;
	public getAutoAttachingEndorsementsSpy: jasmine.Spy;
	public riskServiceSpy: jasmine.Spy;
	public riskService: RiskService;
	public endorsementSelector: DebugElement;
	public userServiceSpy: jasmine.Spy;
	public userService: UserService;
	public featureService: FeaturesHttpService

	constructor() {
		endorsementsHttpService = fixture.debugElement.injector.get(EndorsementService);
		this.riskService = fixture.debugElement.injector.get(RiskService);
		this.riskServiceSpy = spyOn(this.riskService, "updateRiskQuestions").and.returnValues(
			of([
				{
					// fill me in
					tag: "one",
				} as RiskQuestion,
			])
		);
		// ** An additional dummy endorsement is added to the list in the endorsement step for bespoke clauses
		this.getAvailableEndorsementsSpy = spyOn(endorsementsHttpService, "getAvailable").and.returnValues(
			of([
				{
					documentId: 1,
					reference: "1",
					title: "USA AND CANADA JURISDICTION ENDORSEMENT",
				},
				{
					documentId: 3,
					reference: "3",
					riskQuestionTags: ["four"],
					title: "USA JURISDICTION ENDORSEMENT",
				},
				{
					documentId: 5,
					reference: "5",
					riskQuestionTags: ["three"],
					title: "PREMIUM PAYMENT ENDORSEMENT",
				},
				{
					documentId: 6,
					reference: "6",
					title: "ENGLISH LANGUAGE AGREEMENT ENDORSEMENT",
				},
				{
					documentId: 7,
					reference: "7",
					title: "TEST ENDORSEMENT",
				},
			])
		);

		this.getAutoAttachingEndorsementsSpy = spyOn(endorsementsHttpService, "getAutoAttaching").and.returnValues(
			of([
				{
					documentId: 1,
					reference: "1",
					riskQuestionTags: ["one"],
					title: "USA AND CANADA JURISDICTION ENDORSEMENT",
				},
				{
					documentId: 6,
					reference: "6",
					riskQuestionTags: ["two", "one"],
					title: "ENGLISH LANGUAGE AGREEMENT ENDORSEMENT",
				},
			])
		);
	}

	public addPageElements() {
		this.endorsementSelector = fixture.debugElement.query(By.css("#endorsementSelect"));
	}
}

@Component({
	selector: "risk-panel",
	template: "",
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MockRiskPanelComponent),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => MockRiskPanelComponent),
			multi: true,
		},
	],
})
class MockRiskPanelComponent implements ControlValueAccessor, Validator {
	@Input() public riskQuestions: RiskQuestion[];
	@Input() public quote: Quote;
	@Input() public isRiskStep: boolean;
	@Output() public onWarningChange = new EventEmitter<boolean>();

	public writeValue(): void {}
	public registerOnChange(): void {}
	public registerOnTouched(): void {}
	public setDisabledState?(): void {}
	public validate(): ValidationErrors {
		return {};
	}
	public registerOnValidatorChange?(): void {}
}

class MockRiskService {
	public updateRiskQuestions = () => from([[]]);
	public getRiskQuestions = () => [];
	public updateRiskQuestionAnswers(): void {}
}

@Injectable()
class MockModalDialogService {
	public openDialog<T, TY>() {}
}

class MockEndorsementService {
	public getAvailable(): Observable<Document[]> {
		return from([[]]);
	}
	public getAutoAttaching(): Observable<Document[]> {
		return from([[]]);
	}
}

@Component({ selector: "quote-additional-insured-modal", template: "" })
class MockQuoteAdditionalInsuredComponent {}

class MockLanguageService {
	public getLanguageById() {
		const language = new Language();
		language.id = 1;
		language.isoCode = "en";
		language.name = "English";
		return language;
	}
}

class MockCoverageService {
	public isQuoteHasBICoverage = () => {};
}

class MockFeaturesHttpService {
	public isFeatureActive = ():Observable<FeatureAccess | any> => {
        const featureAccessReturned = new FeatureAccess();
        featureAccessReturned.hasAccess = true;
        featureAccessReturned.featureName = "HERO_MultiplePropertiesClauseForFrenchTerritories";
		return of(featureAccessReturned);
	};
}

class MockPropertyLimitService {
	public isFeatureAccessible = () => {};
}

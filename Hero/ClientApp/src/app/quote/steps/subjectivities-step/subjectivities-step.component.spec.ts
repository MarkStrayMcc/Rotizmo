import { Component, Injectable, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormControl, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "@app/material/material.module";
import { DropDownItem, Subjectivity } from "@app/models";
import { SubjectivityService } from "@app/quote/services/subjectivity/subjectivity.service";
import { SubjectivitiesStepComponent } from "@app/quote/steps/subjectivities-step/subjectivities-step.component";
import { UserService } from "@app/services/user.service";
import { Observable, of } from "rxjs";
import { getTestQuote } from "test-helpers";
import { MockUserService } from "../base-step.component.mock";

@Component({
    template: "",
})
class MockAutocompleteComponent {
    @Input() public myControl: FormControl;
    @Input("dataSource") public dataSource: Observable<any>;
    @Input("placeholder") public placeholderText: string = "";
    @Input("isValid") public valid: boolean;
    @Input("selectedValue") public selectedValue: any;
    public allOptions: DropDownItem[];
    public setOption(options: any) {
        this.allOptions = options;
    }
}

@Injectable()
class MockSubjectivityService {
    formatSubjectivityDisplayText = () => null;
    getAvailableSubjectivities = () => mockSubjectivityList;
    getApprovedSubjectivities = () => mockSubjectivityList;
    getDefaultSubjectivities = () => of(mockSubjectivityList);
    getMainData = () => of(mockSubjectivityList);
    search = () => of(mockSubjectivityList);
    setApprovedSubjectivities = () => [];
    setAvailableSubjectivities = () => [];
}

describe("SubjectivitiesStepComponent", () => {
    let component: SubjectivitiesStepComponent;
    let fixture: ComponentFixture<SubjectivitiesStepComponent>;
    let subjectivityService: SubjectivityService;

    const testModuleConfiguration = {
        declarations: [MockAutocompleteComponent, SubjectivitiesStepComponent],
        providers: [
            FormBuilder,
            {
                provide: SubjectivityService,
                useClass: MockSubjectivityService,
            },
            { provide: UserService, useClass: MockUserService },
        ],
        imports: [
            BrowserModule,
            BrowserAnimationsModule,
            ReactiveFormsModule,
            MaterialModule,
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(SubjectivitiesStepComponent);
        component = fixture.componentInstance;

        component.vm = getTestQuote();

        subjectivityService = TestBed.inject(SubjectivityService);
    });

    it("should create the component", () => {
        expect(component).toBeDefined();
    });

    describe("ngOnInit", () => {
        beforeEach(() => {
            component.currentDirection = undefined;
            component.ngOnInit();
        });

        it("should create a form", () => {
            expect(component.stepForm).toBeDefined();
            expect(component.stepForm.get("selectedValue")).toBeDefined();
            expect(component.stepForm.get("days")).toBeDefined();
        });

        it("should watch errors to be set to true", () => {
            expect(component.watchingErrors).toBe(true);
        });

        it("should set the direction to prior if direction is unset", () => {
            expect(component.currentDirection).toBe(component.priorDescription);
        });
    });

    describe("checkValidation", () => {
        beforeEach(() => {
            component.vm.subjectivities.push({
                quoteSubjectivityId: 4,
                quoteId: 1,
                subjectivity: mockSubjectivityList[2],
                isPost: false,
                days: 14,
            });

            fixture.detectChanges();
        });

        it("should show a validation error when selecting a subjectivity with same text as another already in the list", () => {
            // Arrange
            component.stepForm.controls.selectedValue.setValue({
                text: "Please provide satisfactory resume.",
                value: "4",
                img: "",
                hidden: "",
            });
            component.stepForm.controls.selectedValue.markAsDirty();

            // Act
            const result = component.checkValidation();

            // Assert
            expect(result).toBe(true);
            expect(component.formErrors.days.length).toBe(0);
        });

        it("should show a validation error when a negative amount of days is inserted", () => {
            // Arrange
            component.watchingErrors = true;
            component.days = -1;
            component.currentDirection = component.postDescription;

            component.stepForm.controls.selectedValue.setValue({
                text: "test",
                value: "4",
                img: "",
                hidden: "",
            });

            // Act
            const result = component.checkValidation();

            // Assert
            expect(result).toBe(true);
            expect(component.formErrors.days.length).toBeGreaterThan(0);
        });

        it("should show a validation error when a zero days is inserted", () => {
            // Arrange
            component.watchingErrors = true;
            component.days = 0;
            component.currentDirection = component.postDescription;
            component.stepForm.controls.selectedValue.setValue({
                text: "test",
                value: "4",
                img: "",
                hidden: "",
            });

            // Act
            const result = component.checkValidation();

            // Assert
            expect(result).toBe(true);
            expect(component.formErrors.days.length).toBeGreaterThan(0);
        });
    });

    describe("insertSubjectivity", () => {
        beforeEach(() => {
            component.getMainSubjectivitiesData();
            component.watchingErrors = true;
            component.days = 1;
            component.currentDirection = component.postDescription;

            spyOn(subjectivityService, "setAvailableSubjectivities");

            fixture.detectChanges();
        });

        it("should insert a subjectivity with an existing id and remove one item from the available list", () => {
            // Arrange
            const expectedSubjectivity = {
                subjectivityId: 2,
                text: "Please provide satisfactory resume.",
            };
            const expectedSubjectivities = mockSubjectivityList.filter(
                (s) => s.subjectivityId !== expectedSubjectivity.subjectivityId
            );

            // Act
            component.insertSubjectivity(
                expectedSubjectivity.subjectivityId,
                expectedSubjectivity.text,
                true
            );

            // Assert
            expect(
                component.vm.subjectivities.some(
                    (s) =>
                        s.subjectivity.subjectivityId ===
                        expectedSubjectivity.subjectivityId
                )
            ).toBe(true);
            expect(
                subjectivityService.setAvailableSubjectivities
            ).toHaveBeenCalledWith(expectedSubjectivities);
        });

        it("should insert a subjectivity with id 0 (bespoke) and keep the available list the same length", () => {
            // Arrange
            const expectedSubjectivity = {
                subjectivityId: 0,
                text: "Tomato subjectivity.",
            };

            // Act
            component.insertSubjectivity(
                expectedSubjectivity.subjectivityId,
                expectedSubjectivity.text,
                true
            );

            // Assert
            expect(
                component.vm.subjectivities.some(
                    (s) =>
                        s.subjectivity.subjectivityId ===
                        expectedSubjectivity.subjectivityId
                )
            ).toBe(true);
            expect(
                subjectivityService.setAvailableSubjectivities
            ).toHaveBeenCalledTimes(0);
        });
    });

    describe("getMainSubjectivitiesData", () => {
        beforeEach(() => {
            component.vm.subjectivities = [];
        });

        it("should load the subjectivities list and set approved and available subjectivities and the feature heroFrenchLanguageOption is on", () => {
            // Arrange
            spyOn(subjectivityService, "search").and.returnValue(of(mockSubjectivityList));
            spyOn(subjectivityService, "setApprovedSubjectivities");
            spyOn(subjectivityService, "getDefaultSubjectivities").and.returnValue(of(mockDefaultSubjectivityList));
            spyOn(subjectivityService, "setAvailableSubjectivities");

            // Act
            component.getMainSubjectivitiesData();

            expect(subjectivityService.search).toHaveBeenCalledTimes(1);
            expect(subjectivityService.setApprovedSubjectivities).toHaveBeenCalledTimes(1);
            expect(subjectivityService.setApprovedSubjectivities).toHaveBeenCalledWith(mockSubjectivityList);
            expect(subjectivityService.getDefaultSubjectivities).toHaveBeenCalledTimes(1);
            expect(subjectivityService.setAvailableSubjectivities).toHaveBeenCalledTimes(2);
            expect(subjectivityService.setAvailableSubjectivities).toHaveBeenCalledWith([
                mockSubjectivityList[1],
                mockSubjectivityList[2],
            ]);
        });
    });
});

const mockDefaultSubjectivityList: Subjectivity[] = [
    {
        subjectivityId: 131465,
        text: "Confirmation of the New Jersey transaction number.",
        createdBy: "rdf",
        reviewEmailSentOn: new Date(),
        reviewedOn: new Date(),
        reviewedBy: "rdf",
        isApproved: true,
        rejectedReason: "",
        deletedOn: null,
        products: [15],
        countries: [1, 2, 3, 4],
        deletedBy: null,
    },
];

const mockSubjectivityList: Subjectivity[] = [
    {
        subjectivityId: 131465,
        text: "Confirmation of the New Jersey transaction number.",
        createdBy: "rdf",
        reviewEmailSentOn: new Date(),
        reviewedOn: new Date(),
        reviewedBy: "rdf",
        isApproved: true,
        rejectedReason: "",
        deletedOn: null,
        products: [15],
        countries: [1, 2, 3, 4],
        deletedBy: null,
    },
    {
        subjectivityId: 131466,
        text: "Satisfactory five year loss run, including full details of all claims and up to date reserves.",
        createdBy: "rdf",
        reviewEmailSentOn: new Date(),
        reviewedOn: new Date(),
        reviewedBy: "rdf",
        isApproved: true,
        rejectedReason: "",
        deletedOn: null,
        products: [15],
        countries: [1, 2, 3, 4],
        deletedBy: null,
    },
    {
        subjectivityId: 4,
        text: "Please provide satisfactory resume.",
        createdBy: "rdf",
        reviewEmailSentOn: new Date(),
        reviewedOn: new Date(),
        reviewedBy: "rdf",
        isApproved: true,
        rejectedReason: "",
        deletedOn: null,
        products: [15],
        countries: [1, 2, 3, 4],
        deletedBy: null,
    },
];

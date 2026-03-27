import {Component, Injectable, Input} from "@angular/core";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MaterialModule} from "@app/material/material.module";
import {DropDownItem, Subjectivity} from "@app/models";
import {SearchSubjectivitiesResult} from "@app/models/subjectivity-configuration/SearchSubjectivitiesResult";
import {SubjectivityService} from "@app/quote/services/subjectivity/subjectivity.service";
import {UserService} from "@app/services/user.service";
import {Observable, of} from "rxjs";
import {getTestQuote} from "test-helpers";
import {MockUserService} from "../base-step.component.mock";
import {
    SubjectivityConfigurationStepComponent
} from "@app/quote/steps/subjectivity-configuration-step/subjectivity-configuration-step.component";
import {SubjectivityConfiguration} from "@app/models/subjectivity-configuration/SubjectivityConfiguration";
import {LanguageService} from "@app/quote/services/language.service";

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
    searchInSubjectivityConfiguration = () => of(mockSubjectivityResponse);
    setApprovedSubjectivities = () => [];
    setAvailableSubjectivities = () => [];
}

class MockLanguageService {
    public getLanguageById = () => {
    };
}

describe("SubjectivityConfigurationComponent", () => {
    let component: SubjectivityConfigurationStepComponent;
    let fixture: ComponentFixture<SubjectivityConfigurationStepComponent>;
    let subjectivityService: SubjectivityService;

    const testModuleConfiguration = {
        declarations: [MockAutocompleteComponent, SubjectivityConfigurationStepComponent],
        providers: [
            FormBuilder,
            {
                provide: SubjectivityService,
                useClass: MockSubjectivityService,
            },
            {provide: UserService, useClass: MockUserService},
            {provide: LanguageService, useClass: MockLanguageService}
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

        fixture = TestBed.createComponent(SubjectivityConfigurationStepComponent);
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
            const expectedSubjectivity: SubjectivityConfiguration = {
                subjectivityId: "66fc94d4-0376-48b5-9a89-01b91850a66a",
                text: "Mock subjectivity from subjectivity configuration version 1",
                languageIsoCode: "en",
                type: "confirmation",
                daysToResolve: 5,
                isAutoAttaching: true,
            };

            const expectedSubjectivities = mockSubjectivityList.filter(
                (s) => s.subjectivityId !== expectedSubjectivity.subjectivityId
            );

            // Act
            component.addSubjectivityToQuote(expectedSubjectivity, false);

            // Assert
            expect(
                component.vm.subjectivities.some(
                    (s) =>
                        s.subjectivityUid ===
                        expectedSubjectivity.subjectivityId
                )
            ).toBe(true);
        });

        it("should insert a subjectivity with id 0 (bespoke) and keep the available list the same length", () => {
            // Arrange
            const expectedSubjectivity: SubjectivityConfiguration = {
                subjectivityId: "66fc94d4-0376-48b5-9a89-01b91850a66a",
                text: "Mock subjectivity from subjectivity configuration version 1",
                languageIsoCode: "en",
                type: "confirmation",
                daysToResolve: 5,
                isAutoAttaching: true,
            };

            // Act
            component.addSubjectivityToQuote(expectedSubjectivity);

            // Assert
            expect(
                component.vm.subjectivities.some(
                    (s) =>
                        s.subjectivityUid ===
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

        it("should call searchInSubjectivityConfiguration", () => {
            //Arrange

            spyOn(subjectivityService, "searchInSubjectivityConfiguration").and.returnValue(of(mockSubjectivityResponse));

            //Act
            component.getMainSubjectivitiesData();

            expect(subjectivityService.searchInSubjectivityConfiguration).toHaveBeenCalledTimes(1);
        });
    });
});

const mockSubjectivityResponse: SearchSubjectivitiesResult[] = [
    {
        id: "66fc94d4-0376-48b5-9a89-01b91850a66a",
        texts: [
            {
                text: "Mock subjectivity from subjectivity configuration version 1",
                languageIsoCode: "en"
            }
        ],
        type: "confirmation",
        isAutoAttaching: true,
        daysToResolve: 5
    },
    {
        id: "cefd6471-5224-4bb3-af27-37e55d99edbf",
        texts: [
            {
                text: "Mock subjectivity from subjectivity configuration version 2",
                languageIsoCode: "en"
            }
        ],
        type: "document",
        isAutoAttaching: false,
        daysToResolve: 0
    }
]

const mockSubjectivityList: SubjectivityConfiguration[] = [
    {
        subjectivityId: "66fc94d4-0376-48b5-9a89-01b91850a66a",
        text: "Mock subjectivity from subjectivity configuration version 1",
        languageIsoCode: "en",
        type: "confirmation",
        daysToResolve: 5,
        isAutoAttaching: true,
    },
    {
        subjectivityId: "cefd6471-5224-4bb3-af27-37e55d99edbf",
        text: "Mock subjectivity from subjectivity configuration version 2",
        languageIsoCode: "en",
        type: "document",
        daysToResolve: 0,
        isAutoAttaching: false,
    }
]

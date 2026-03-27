import { APP_BASE_HREF } from "@angular/common";
import { async, ComponentFixture, TestBed, fakeAsync } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "@app/material/material.module";
import { CfcContact } from "@app/models";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { AutocompleteMultiselectComponent } from "@app/components/autocomplete-multiselect/autocomplete-multiselect.component";

let fixture: ComponentFixture<AutocompleteMultiselectComponent>;

describe("AutocompleteDropdown", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AutocompleteDropdown,
                AutocompleteMultiselectComponent
            ],
            imports: [
                BrowserAnimationsModule,
                ReactiveFormsModule,
                MaterialModule
            ],
            providers: [
                { provide: APP_BASE_HREF, useValue: "/" }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AutocompleteMultiselectComponent);
        fixture.componentInstance.options =
        [
            {
                cfcContactId: 1,
                firstName: "Peter",
                lastName: "Wesson",
                initials: "PJW",
                email: "pwesson@cfcunderwriting.com",
                active: true,
                name: "Peter Wesson",
                profileImageUrl: null
            },
            {
                cfcContactId: 1,
                firstName: "Test",
                lastName: "User",
                initials: "TUD",
                email: "tuser@cfcunderwriting.com",
                active: true,
                name: "Test User",
                profileImageUrl: null
            },
            {
                cfcContactId: 1,
                firstName: "Andy",
                lastName: "User",
                initials: "TUD",
                email: "auser@cfcunderwriting.com",
                active: true,
                name: "Andy User",
                profileImageUrl: null
            },
            {
                cfcContactId: 1,
                firstName: "Bob",
                lastName: "Tester",
                initials: "TUD",
                email: "btester@cfcunderwriting.com",
                active: true,
                name: "Bob Tester",
                profileImageUrl: null
            }
        ];

        fixture.componentInstance.myControl = new FormControl("myControl");
        fixture.componentInstance.formCtrl = new FormControl("formCtrl");

        fixture.componentInstance.displayName = (obj) => obj.name;
        fixture.componentInstance.dropDownDisplay = (obj) => obj.name;
        fixture.componentInstance.selectedOptions = [];
    });

    afterEach(() => {
        fixture = undefined;
    });

    it("filter finds element", () => {
        //Arrange
        const expectedResult = {
            cfcContactId: 1,
            firstName: "Peter",
            lastName: "Wesson",
            initials: "PJW",
            email: "pwesson@cfcunderwriting.com",
            active: true,
            name: "Peter Wesson",
            profileImageUrl: null
        };

        //Act
        const result = fixture.componentInstance.filter("Wess");

        //Assert
        expect(result[0]).toEqual(expectedResult);
    });

    it("selected method adds element", fakeAsync(() => {
        //Arrange
      const contact: CfcContact = {
            cfcContactUid: "4e73f08g-6466-4699-826c-e0ad71196d4a",
            cfcContactId: 1,
            firstName: "Test",
            lastName: "User",
            initials: "TUD",
            email: "tuser@cfcunderwriting.com",
            active: true,
            name: "Test User",
            profileImageUrl: null,
            cfcTeamName: "Healthcare US",
            accessLevel: 1,
            roles: [],
            position: "",
            linkedInUrl: "",
            telephone: "",
            accessibleFeatures: [],
            cfcTeamCoverholder: "CFC Underwriting",
        };

        //Act
        fixture.componentInstance.selected(contact);

        //Assert
        expect(fixture.componentInstance.selectedOptions.length).toBe(1);
        expect(fixture.componentInstance.selectedOptions[0].name).toBe(contact.name);
    }));

    it("remove method removes element", () => {
        //Arrange
        const contact: CfcContact = {
            cfcContactUid: "4e73f08g-6466-4699-826c-e0ad71196d4a",
            cfcContactId: 1,
            firstName: "Test",
            lastName: "User",
            initials: "TUD",
            email: "tuser@cfcunderwriting.com",
            active: true,
            name: "Test User",
            profileImageUrl: null,
            cfcTeamName: "Healthcare US",
            accessLevel: 1,
            roles: [],
            position: "",
            linkedInUrl: "",
            telephone: "",
            accessibleFeatures: [],
            cfcTeamCoverholder: "CFC Underwriting",
        };

        //Act
        fixture.componentInstance.selected(contact);
        const addedContact: CfcContact = fixture.componentInstance.selectedOptions[0];
        fixture.componentInstance.removeOption(addedContact, new MouseEvent("click"));

        //Assert
        expect(fixture.componentInstance.selectedOptions.length).toBe(0);
        expect(addedContact.name).toBe(contact.name);
    });
});

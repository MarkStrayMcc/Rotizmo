import { OverlayContainer } from "@angular/cdk/overlay";
import { APP_BASE_HREF } from "@angular/common";
import { Component, Directive, NgModule, ViewChild, ViewContainerRef } from "@angular/core";
import { async, ComponentFixture, inject, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { Observable, of} from "rxjs";
import { ClientNote } from "@app/models";
import { ClientNoteHttpService } from "../../../services/clientnote-http.service";
import { QuoteModule } from "../../quote.module";
import { UnderwriterNotesModal } from "./underwriter-notes-modal.component";

/* tslint:disable:max-classes-per-file */
let underwriterNotesTest: UnderwriterNotesModalTest;
let dialog: MatDialog;
let dialogRef: MatDialogRef<UnderwriterNotesModal>;
let overlayContainerElement: HTMLElement;

let testViewContainerRef: ViewContainerRef;
let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

// TODO: Rewrite these unit tests with mocks and spies, performance was too bad post-Daixit
//describe("UnderwriterNotesModal", () => {
//    let modalDialogService: ModalDialogService;
//    let clientNoteHttpService: ClientNoteHttpService;

//    beforeEach(async(() => {
//        TestBed.configureTestingModule({
//            imports: [
//                DialogTestModule
//            ],
//            providers: [
//                {
//                    provide: OverlayContainer, useFactory: () => {
//                        overlayContainerElement = document.createElement("div");
//                        return { getContainerElement: () => overlayContainerElement };
//                    }
//                },
//                { provide: APP_BASE_HREF, useValue: "/" },
//                FormBuilder,
//                MatDialog,
//                ClientNoteHttpService,
//                ModalDialogService
//            ]
//        }).compileComponents();
//    }));

//    beforeEach(inject([MatDialog],
//        (d: MatDialog) => {
//            dialog = d;
//        }));

//    beforeEach(async(() => {
//        createComponent();
//        modalDialogService = TestBed.inject(ModalDialogService);
//        clientNoteHttpService = TestBed.inject(ClientNoteHttpService);
//    }));

//    it("we should have three clients notes", () => {
//        expect(underwriterNotesTest.getClientNotes).toHaveBeenCalled();
//        expect(dialogRef.componentInstance.underwriterNotes.length).toBe(3);
//    });

//    it("we should have two parent clients notes", () => {
//        expect(underwriterNotesTest.getClientNotes).toHaveBeenCalled();
//        expect(dialogRef.componentInstance.parentNotes.length).toBe(2);
//    });

//    it("client note one should have one child note", () => {
//        expect(dialogRef.componentInstance.getChildNotes(1).length).toBe(1);
//    });

//    it("when we add a new note we should see it first in the list", () => {
//        // Arrange
//        const clientNote = new ClientNote();
//        clientNote.note = "test text";

//        spyOn(clientNoteHttpService, "add").and.returnValue(Observable.of(clientNote));

//        // Act
//        dialogRef.componentInstance.addNote(clientNote.note);

//        // Assert
//        viewContainerFixture.detectChanges();
//        viewContainerFixture.whenStable().then(() => {
//            expect(dialogRef.componentInstance.underwriterNotes.length).toBe(4);
//            expect(dialogRef.componentInstance.underwriterNotes[0].note).toBe(clientNote.note);
//            expect(clientNoteHttpService.add).toHaveBeenCalledTimes(1);
//        });
//    });

//    it("when we add a reply we should see it last in the list", () => {
//        // Arrange
//        const clientNote = new ClientNote();
//        clientNote.note = "test reply";
//        clientNote.parentClientNoteId = 1;

//        spyOn(clientNoteHttpService, "add").and.returnValue(Observable.of(clientNote));

//        // Act
//        dialogRef.componentInstance.addNote(clientNote.note, clientNote.parentClientNoteId);

//        // Assert
//        viewContainerFixture.detectChanges();
//        viewContainerFixture.whenStable().then(() => {
//            expect(dialogRef.componentInstance.getChildNotes(1).length).toBe(2);
//            expect(dialogRef.componentInstance.getChildNotes(1)[1].note).toBe(clientNote.note);
//        });
//    });

//    it("Should update overlay backdrop height when adding a new note", () => {
//        // Actors
//        const clientNote = new ClientNote();
//        clientNote.note = "This is a test note.";
//        spyOn(clientNoteHttpService, "add").and.returnValue(Observable.of(clientNote));

//        // Actions
//        dialogRef.componentInstance.addNote(clientNote.note);

//        // Asserts
//        viewContainerFixture.detectChanges();
//        viewContainerFixture.whenStable().then(() => {
//            expect(dialogRef.componentInstance.underwriterNotes.length).toBe(4);
//            expect(clientNoteHttpService.add).toHaveBeenCalledTimes(1);
//        });
//    });
//});

function createComponent() {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;

    dialogRef = dialog.open(UnderwriterNotesModal, {
        viewContainerRef: testViewContainerRef
    });

    underwriterNotesTest = new UnderwriterNotesModalTest();

    viewContainerFixture.detectChanges();
    /* tslint:disable:no-empty */
    viewContainerFixture.whenStable().then(() => { });
    /* tslint:enable:no-empty */
}
/* tslint:disable:object-literal-sort-keys */
class UnderwriterNotesModalTest {
    public getClientNotes: jasmine.Spy;
    public addClientNotes: jasmine.Spy;

    public clientNotesHttpService: ClientNoteHttpService;
    constructor() {

        dialogRef.componentInstance.clientId = 62854;

        this.getClientNotes = spyOn(dialogRef.componentInstance.clientNoteHttpService, "getMainData")
            .and.returnValue(of(
                [{
                    clientNoteId: 0,
                    clientId: 11121,
                    parentClientNoteId: 0,
                    note: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
                        "Nulla facilisis justo vel dapibus vulputate.",
                    created: new Date(),
                    authorInitials: "CRP",
                    authorName: "Chloe Jones",
                    imageUrl: "",
                    formattedCreatedDate: "19th February " + (new Date()).getFullYear() + " at 14:55:28"
                },
                {
                    clientNoteId: 1,
                    clientId: 11121,
                    parentClientNoteId: 0,
                    note: "Quisque iaculis ante vitae iaculis auctor.",
                    created: new Date(),
                    authorInitials: "CRP",
                    authorName: "Cristina Popescu",
                    imageUrl: "",
                    formattedCreatedDate: "19th February " + (new Date()).getFullYear() + " at 14:55:28"
                },
                {
                    clientNoteId: 2,
                    clientId: 11121,
                    parentClientNoteId: 1,
                    note: "Test child note",
                    created: new Date(),
                    authorInitials: "PJW",
                    authorName: "Peter Wesson",
                    imageUrl: "",
                    formattedCreatedDate: "19th February " + (new Date()).getFullYear() + " at 14:55:28"
                }]
            ));
    }
}

@Directive({ selector: "dir-with-view-container" })
class DirectiveWithViewContainer {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    selector: "arbitrary-component",
    template: `<dir-with-view-container></dir-with-view-container>`
})
class ComponentWithChildViewContainer {
    @ViewChild(DirectiveWithViewContainer) public childWithViewContainer: DirectiveWithViewContainer;

    get childViewContainer() {
        return this.childWithViewContainer.viewContainerRef;
    }
}

const TEST_DIRECTIVES = [
    ComponentWithChildViewContainer,
    DirectiveWithViewContainer
];

@NgModule({
    declarations: [
        TEST_DIRECTIVES
    ],
    exports: [
        TEST_DIRECTIVES,
        UnderwriterNotesModal
    ],
    imports: [
        NoopAnimationsModule,
        QuoteModule
    ]
})
class DialogTestModule { }

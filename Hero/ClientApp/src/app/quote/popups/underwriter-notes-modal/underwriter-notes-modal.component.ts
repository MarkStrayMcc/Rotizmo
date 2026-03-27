import { Component, OnDestroy, OnInit, HostListener } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ClientNoteHttpService } from "../../../services/clientnote-http.service";
import { ErrorMessageHandlerService } from "../../../services/error-message-handler.service";
import { MessageService } from "../../../services/message.service";
import { ClientNote } from "@app/models";
import { CfcContactHttpService } from "../../../services/cfc-contact-http.service";
import { ModalDialogService } from "../../../services/modal-dialog.service";
import { first } from "rxjs/operators";
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: "underwriter-notes-modal",
    templateUrl: "./underwriter-notes-modal.component.html",
    styleUrls: ["./underwriter-notes-modal.component.scss"]
})
export class UnderwriterNotesModal implements OnInit, OnDestroy {
    public newNote: string = "";
    public underwriterNotes: ClientNote[];
    public clientId: number;
    public isLoaded: boolean = false;
    public clientNoteSubscription: Subscription;
    public clientNoteSaveSubscription: Subscription;
    public hasNoError: boolean = true;
    public currentYear = (new Date()).getFullYear();

    constructor(public dialogRef: MatDialogRef<UnderwriterNotesModal>,
                public clientNoteHttpService: ClientNoteHttpService,
                public messageErrorHandler: ErrorMessageHandlerService,
                public messageService: MessageService,
                public cfcContactHttpService: CfcContactHttpService,
                public modalDialogService: ModalDialogService,
                private cookieService: CookieService) {

        dialogRef.backdropClick().subscribe(_ => {
            this.onCloseModal();
        });
    }

    @HostListener('window:keyup.esc')
    public onKeyUp() {
        this.onCloseModal();
    }


    public get newNoteValue() {
        return this.newNote;
    }

    public set newNoteValue(value) {
        this.newNote = value;
    }

    public get parentNotes(): ClientNote[] {
        return this.underwriterNotes.filter(x =>
            !x.parentClientNoteId &&
            this.getYear(x.formattedCreatedDate) === +this.currentYear);
    }

    public get years(): number[] {
        const years = this.underwriterNotes
            .filter(x => !x.parentClientNoteId)
            .map(x => this.getYear(x.formattedCreatedDate))
            .filter((value, index, self) => self.indexOf(value) === index);

        const currentYear = (new Date()).getFullYear();

        if (years.indexOf(currentYear) === -1) {
            years.push(currentYear);
        }

        return years.sort().reverse();
    }

    public ngOnInit() {
        this.underwriterNotes = Array<ClientNote>();

        this.clientNoteSubscription = this.clientNoteHttpService.getMainData(this.clientId)
            .subscribe((x) => {
                    this.underwriterNotes = x;
                },
                (error) => {
                    this.messageErrorHandler.handleError(error);
                });

        this.dialogRef.afterOpened().pipe(first()).subscribe(() => {
            this.isLoaded = true;
        });
    }

    public ngOnDestroy(): void {
        if (this.clientNoteSubscription) {
            this.clientNoteSubscription.unsubscribe();
        }

        if (this.clientNoteSaveSubscription) {
            this.clientNoteSaveSubscription.unsubscribe();
        }
    }

    public addNote(text: string, parentClientNoteId?: number) {
        let initials = "TXU";

        if (this.cookieService.check("UserInitials")) {
            initials = this.cookieService.get("UserInitials");
        }


        if (initials && text && text !== "") {
            const clientNote = {
                clientNoteId: 0,
                clientId: this.clientId,
                parentClientNoteId: parentClientNoteId,
                note: text,
                created: new Date(),
                authorInitials: initials,
            } as ClientNote;

            this.saveNote(clientNote);

            if (!parentClientNoteId) {
                this.currentYear = (new Date()).getFullYear();
            }
        }
    }

    public getChildNotes(clientNoteId: number) {
        return this.underwriterNotes
            .filter(x => x.parentClientNoteId === clientNoteId).reverse();
    }

    public onCloseModal(): void {
        this.messageService.clearMessage();
        this.dialogRef.close();
    }

    private saveNote(clientNote: ClientNote) {
        this.clientNoteSaveSubscription = this.clientNoteHttpService.add(clientNote).subscribe(
            (data) => {
                this.messageService.clearMessage();
                this.hasNoError = true;
                this.underwriterNotes.unshift(data);
                this.newNote = "";
            },
            (error) => {
                this.hasNoError = false;
                error.message = "The save couldn't be completed because an error occurred.";
                this.messageErrorHandler.handleError(error);
            });
    }

    private getYear(formattedDate: string): number {
        return formattedDate ? +formattedDate.split(" ")[2] : 0;
    }
}

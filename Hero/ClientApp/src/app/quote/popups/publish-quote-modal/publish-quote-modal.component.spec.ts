import { MatDialogModule, MatDialogRef } from "@angular/material";
import { ReactiveFormsModule, FormsModule, NG_VALUE_ACCESSOR, FormGroup, ControlValueAccessor } from "@angular/forms";
import { PublishQuoteModalComponent } from "@app/quote/popups/publish-quote-modal/publish-quote-modal.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { QuoteHttpService } from "@app/services/quote-http.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { Component, forwardRef, Injectable } from "@angular/core";
import { QuotePublishRequest } from "@app/models";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { MessageService } from "@app/services/message.service";
import { Observable, of } from "rxjs";

describe("PublishQuoteModalComponent",
    () => {
        let component: PublishQuoteModalComponent;
        let fixture: ComponentFixture<PublishQuoteModalComponent>;
        let matDialogRef: MatDialogRef<PublishQuoteModalComponent>;
        let quoteHttpService: QuoteHttpService;
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    PublishQuoteModalComponent,
                    MockMessageComponent,
                    MockMatProgressSpinner
                ],
                imports: [
                    MatDialogModule,
                    ReactiveFormsModule,
                    FormsModule
                ],
                providers: [
                    { provide: MatDialogRef, useClass: MockMatDialogRef },
                    { provide: ModalDialogService, useClass: MockModalDialogService },
                    { provide: QuoteHttpService, useClass: MockQuoteHttpService },
                    { provide: ErrorMessageHandlerService, useClass: MockErrorMessageHandlerService },
                    { provide: MessageService, useClass: MockMessageService }
                ]
            }).compileComponents();
        }));

        beforeEach(() => {
            matDialogRef = TestBed.inject(MatDialogRef);
            fixture = TestBed.createComponent(PublishQuoteModalComponent);
            quoteHttpService = TestBed.inject(QuoteHttpService);
            spyOn(quoteHttpService, "publishQuote").and.callThrough();
            component = fixture.componentInstance;
            component.publishRequest = getTestPublishRequest();
            fixture.detectChanges();
        });

        it("Should create component", () => {
            expect(component).toBeDefined();
        });

        it("Should close Material modal when closing modal", () => {
            // Actors
            spyOn(matDialogRef, "close");

            // Actions
            component.onCloseModal();

            // Asserts
            expect(matDialogRef.close).toHaveBeenCalledTimes(1);
        });

        it("Should set the isPublished to true after publishing quote", () => {

            //Actions
            spyOn(matDialogRef, "close");

            //Act
            component.publishQuote();

            //Assert
            expect(quoteHttpService.publishQuote).toHaveBeenCalled();
            expect(component.publishRequest.isPublished).toBeTruthy();
            expect(matDialogRef.close).toHaveBeenCalledTimes(1);
        });
    });

class MockMatDialogRef<T> {
    public close(dialogResult?: any): void { return; }
    public afterOpen = () => of([true]);
}

class MockModalDialogService { }

class MockErrorMessageHandlerService { }

class MockMessageService {
    public clearMessage(): void { }
}

@Component({
    selector: "message",
    template: ""
})
class MockMessageComponent {
}
@Component({
    selector: "mat-progress-spinner",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockMatProgressSpinner),
            multi: true
        }
    ]
})
class MockMatProgressSpinner {
    public writeValue = obj => { };
    public registerOnChange = fn => { };
    public registerOnTouched = fn => { };
}

@Injectable()
class MockQuoteHttpService {
    public publishQuote(quotePublishRequest: QuotePublishRequest): Observable<boolean> {
        return of(true);
    }
}

function getTestPublishRequest(): QuotePublishRequest {
    return {
        quoteId: 1,
        isPublished: false,
        isBindable: false
    } as QuotePublishRequest;
}

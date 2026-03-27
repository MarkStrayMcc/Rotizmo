import { async, TestBed, ComponentFixture } from "@angular/core/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { PreviewDocumentModalComponent } from "@app/quote/popups/preview-document-modal/preview-document-modal.component";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { PreviewDocumentFormat } from "@app/enums/PreviewDocumentFormat";

describe("PreviewDocumentModalComponent",
    () => {
        let component: PreviewDocumentModalComponent;
        let fixture: ComponentFixture<PreviewDocumentModalComponent>;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    PreviewDocumentModalComponent,
                    MockPdfViewerComponent,
                    MockMatProgressSpinnerComponent
                ],
                imports: [
                    MatDialogModule,
                    ReactiveFormsModule
                ]
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(PreviewDocumentModalComponent);
            component = fixture.componentInstance;
            component.documentType = PreviewDocumentFormat.Pdf;
            fixture.detectChanges();
        });

        it("Should create component", () => {
            expect(component).toBeDefined();
        });
    });

@Component({ selector: "pdf-viewer", template: "" })
class MockPdfViewerComponent {
    @Input() public src = "";
    @Input("original-size") public originalSize;
    @Input("zoom") public zoom;
    @Output("after-load-complete") public afterLoadComplete = new EventEmitter();
}

@Component({ selector: "mat-progress-spinner", template: "" })
class MockMatProgressSpinnerComponent {

}

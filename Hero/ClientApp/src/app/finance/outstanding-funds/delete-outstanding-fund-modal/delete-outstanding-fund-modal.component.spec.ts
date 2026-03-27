import { TestBed, ComponentFixture } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { DeleteOutstandingFundModalComponent } from "./delete-outstanding-fund-modal.component";

describe("DeleteOutstandingFundModalComponent", () => {
    let component: DeleteOutstandingFundModalComponent;
    let fixture: ComponentFixture<DeleteOutstandingFundModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ DeleteOutstandingFundModalComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: MatDialogRef, useValue: {} }
            ]
        });
        fixture = TestBed.createComponent(DeleteOutstandingFundModalComponent);
        component = fixture.componentInstance;
    });

    it("should create component", () => {
        expect(component).toBeDefined();
    });
});

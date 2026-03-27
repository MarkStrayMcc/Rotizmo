import { TestBed, ComponentFixture } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { OutstandingFundsHttpService } from "@app/services/finance/outstanding-funds/outstanding-funds-http.service";
import { TransferToOfficeModalComponent } from "./transfer-to-office-modal.component";

describe("TransferToOfficeModalComponent", () => {
    let component: TransferToOfficeModalComponent;
    let fixture: ComponentFixture<TransferToOfficeModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ TransferToOfficeModalComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: OutstandingFundsHttpService, useValue: {} },
            ]
        });
        fixture = TestBed.createComponent(TransferToOfficeModalComponent);
        component = fixture.componentInstance;
    });

    it("should create component", () => {
        expect(component).toBeDefined();
    });
});

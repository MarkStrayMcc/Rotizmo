import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { APP_BASE_HREF } from "@angular/common";
import { BrowserModule, By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "@app/material/material.module";
import { EcfReconciliationPageComponent } from './ecf-reconciliation-page.component';
import { FilterContextService } from "@app/finance/ecf-reconciliation/filter-context.service";

describe('ecf-reconciliation component', () => {
    let component: EcfReconciliationPageComponent;
    let fixture: ComponentFixture<EcfReconciliationPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                EcfReconciliationPageComponent
            ],
            imports: [
                BrowserModule,
                BrowserAnimationsModule,
                MaterialModule,
                RouterTestingModule
            ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },
                { provide: FilterContextService },
                { provide: APP_BASE_HREF, useValue: "/" }
            ]
        });

        fixture = TestBed.createComponent(EcfReconciliationPageComponent);
        component = fixture.componentInstance;
    });

    it("should create component", () => {
        expect(component).toBeDefined();
    });

    it("should have 3 tabs", () => {
        // Arrange
        const tabs = fixture.debugElement.queryAll(By.css("[mat-tab-link]"));
        // Assert
        expect(tabs.length).toEqual(3);
    });

    it("should have a correct link for summary tab", () => {
        // Arrange
        const tabs = fixture.debugElement.queryAll(By.css("[mat-tab-link]"));
        const href = tabs[0].nativeElement.getAttribute("href");

        // Assert
        expect(href).toBe("/finance/ecf-reconciliation");
    });

    it("should have a correct link for financial items tab", () => {
        // Arrange
        const tabs = fixture.debugElement.queryAll(By.css("[mat-tab-link]"));
        const href = tabs[1].nativeElement.getAttribute("href");

        // Assert
        expect(href).toBe("/finance/ecf-reconciliation/financial-transactions");
    });

    it("should have a correct link for claim financial items tab", () => {
        // Arrange
        const tabs = fixture.debugElement.queryAll(By.css("[mat-tab-link]"));
        const href = tabs[2].nativeElement.getAttribute("href");

        // Assert
        expect(href).toBe("/finance/ecf-reconciliation/claim-financial-items");
    });
});

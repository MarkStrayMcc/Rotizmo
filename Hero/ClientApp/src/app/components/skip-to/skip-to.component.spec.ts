import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SkipToComponent } from "./skip-to.component";

describe("SkipToComponent", () => {
    let component: SkipToComponent;
    let fixture: ComponentFixture<SkipToComponent>;
    let element: HTMLElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SkipToComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SkipToComponent);
        component = fixture.componentInstance;
        element = fixture.debugElement.nativeElement;
        fixture.detectChanges();
    });

    it("Should create component", () => {
        expect(component).toBeTruthy();
    });

    it("Should initialise text label depending on input value", () => {
        // Actors
        const isPreviousInitial = component.isPrevious;
        const textLabelInitial = element.querySelector("a").textContent.trim();
        
        // Actions
        component.isPrevious = true;
        component.ngOnInit();
        fixture.detectChanges();

        // Asserts
        expect(isPreviousInitial).toBeFalsy();
        expect(textLabelInitial).toBe("NEXT");
        expect(component.isPrevious).toBeTruthy();
        expect(element.querySelector("a").textContent.trim()).toBe("PREVIOUS");
    });

    it("Should emit onSkipToClick event on click", async(() => {
        // Actors
        spyOn(component.onSkipToClick, "emit");

        // Actions
        const hyperlink = element.querySelector("a");
        hyperlink.click();

        // Asserts
        fixture.whenStable().then(() => {
            expect(component.onSkipToClick.emit).toHaveBeenCalledTimes(1);
        });
    }));
});

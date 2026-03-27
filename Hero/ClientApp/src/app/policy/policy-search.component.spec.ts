import { Component, Input } from "@angular/core";
import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from "@app/material/material.module";
import { Policy } from "@app/models/auto-generated/Policy";
import { PolicySearchComponent } from "@app/policy/policy-search.component";
import { MtaService } from "@app/policy/services/mta.service";
import { PolicyHttpService } from "@app/services/policy-http.service";
import { Observable, of } from "rxjs";
import { MtaSelectionType } from "./mta/mta-selection.config";

describe("PolicySearchComponent", () => {
    let component: PolicySearchComponent;
    let fixture: ComponentFixture<PolicySearchComponent>;

    class MockPolicyHttpService {
        public getPolicySearchResults(url: string): Observable<Policy[]> {
            return of([
                new Policy()
            ]);
        }
    }

    class MockMtaService {
        public getAllAvailableMtaOptions(url: string): Observable<MtaSelectionType[]> {
            return of([
                new MtaSelectionType()
            ]);
        }
    }

    let policyHttpService: PolicyHttpService;
    let mtaService: MtaService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PolicySearchComponent,
                MockPolicyListComponent,
                MockPolicyListItemComponent,
                MockNoResultsComponent,
                MockMenuComponent
            ],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                BrowserAnimationsModule
            ],
            providers: [
                { provide: PolicyHttpService, useClass: MockPolicyHttpService },
                { provide: MtaService, useClass: MockMtaService }
            ]
        })
            .compileComponents();


    }));

    beforeEach(() => {
        policyHttpService = TestBed.inject(PolicyHttpService);
        mtaService = TestBed.inject(MtaService);
        fixture = TestBed.createComponent(PolicySearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it('should have a control for the search input', () => {
        // Assert
        expect(component.form.get('search')).toBeDefined();
    });

    it('should call policy search endpoint on search changes', fakeAsync(() => {
        // Assemble
        spyOn(policyHttpService, "getPolicySearchResults").and.callThrough();

        // Act
        component.form.get('search').setValue('hello');
        tick(500);

        // Assert
        expect(policyHttpService.getPolicySearchResults).toHaveBeenCalledTimes(1);
    }));
});


@Component({ selector: "policy-list", template: "" })
class MockPolicyListComponent {
    @Input() public policies: Policy[] = new Array<Policy>();
    @Input() public mtaSelectionTypes = new Array<MtaSelectionType>();
}

@Component({ selector: "policy-item", template: "" })
class MockPolicyListItemComponent {
    @Input() public policy: Policy = new Policy();
    @Input() public mtaSelectionTypes = new Array<MtaSelectionType>();
}

@Component({ selector: "no-results", template: "" })
class MockNoResultsComponent { }

@Component({ selector: "menu", template: "" })
class MockMenuComponent {
    @Input() public myControl: FormControl;
}

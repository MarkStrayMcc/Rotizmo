import { Component, Input } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { MaterialModule } from "@app/material/material.module";
import { Policy } from "@app/models/auto-generated/Policy";
import { PolicyListComponent } from "@app/policy/policy-list.component";
import { MtaSelectionType } from "./mta/mta-selection.config";

describe("PolicyListComponent", () => {
    let component: PolicyListComponent;
    let fixture: ComponentFixture<PolicyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyListComponent,
        MockPolicyItemComponent,
        MockNoResultsComponent],
        imports: [MaterialModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
      fixture = TestBed.createComponent(PolicyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

@Component({ selector: "policy-item", template: "" })
class MockPolicyItemComponent {
  @Input() public policy: Policy = new Policy();
  @Input() public mtaSelectionTypes = new Array<MtaSelectionType>();
}

@Component({ selector: "no-results", template: "" })
class MockNoResultsComponent {
}

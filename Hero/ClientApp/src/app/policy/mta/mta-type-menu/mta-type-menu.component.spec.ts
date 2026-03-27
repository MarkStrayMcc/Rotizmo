import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from "@app/material/material.module";
import { Policy } from "@app/models/auto-generated/Policy";
import { MtaService } from "@app/policy/services/mta.service";
import { MtaTypeMenuComponent } from './mta-type-menu.component';

describe('MtaTypeMenuComponent', () => {
  let component: MtaTypeMenuComponent;
  let fixture: ComponentFixture<MtaTypeMenuComponent>;
  let mtaService: MtaService;
  let policy: Policy = new Policy();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MtaTypeMenuComponent],
      imports: [MaterialModule],
      providers: [
        { provide: MtaService, useClass: MockMtaService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MtaTypeMenuComponent);
    mtaService = TestBed.inject<MtaService>(MtaService);
    component = fixture.componentInstance;
    component.policy = policy;
    fixture.detectChanges();
  });

  it('should create MtaTypeMenuComponent', () => {
    expect(component).toBeTruthy();
  });
});

class MockMtaService {
  public handleMta(policy: Policy, mtaType: string) { };
}

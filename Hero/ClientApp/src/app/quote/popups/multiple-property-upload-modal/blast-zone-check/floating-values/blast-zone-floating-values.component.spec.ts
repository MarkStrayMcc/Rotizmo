import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlastZoneFloatingValuesComponent } from './blast-zone-floating-values.component';

describe('BlastZoneFloatingValuesComponent', () => {
  let component: BlastZoneFloatingValuesComponent;
  let fixture: ComponentFixture<BlastZoneFloatingValuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlastZoneFloatingValuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlastZoneFloatingValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit firstLossLimitChange when onFirstLimitChange is called', () => {
    spyOn(component.firstLossLimitChange, 'emit');

    component.onFirstLimitChange(5000);

    expect(component.firstLossLimitChange.emit).toHaveBeenCalledWith(5000);
  });

  it('should emit floatingValuesChange when onFloatingValueChange is called', () => {
    spyOn(component.floatingValuesChange, 'emit');

    component.onFloatingValueChange();

    expect(component.floatingValuesChange.emit).toHaveBeenCalled();
  });
});

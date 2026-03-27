import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlastZoneCheckComponent } from './blast-zone-check.component';

describe('BlastZoneCheckComponent', () => {
  let component: BlastZoneCheckComponent;
  let fixture: ComponentFixture<BlastZoneCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlastZoneCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlastZoneCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

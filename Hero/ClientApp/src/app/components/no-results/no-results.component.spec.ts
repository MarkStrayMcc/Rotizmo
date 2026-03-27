import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoResultsComponent } from './no-results.component';
import { MaterialModule } from '@app/material/material.module';

describe('NoResultsComponent', () => {
    let component: NoResultsComponent;
    let fixture: ComponentFixture<NoResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [NoResultsComponent],
        imports: [MaterialModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
      fixture = TestBed.createComponent(NoResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitProductionPanelComponent } from './unit-production-panel.component';

describe('UnitProductionPanelComponent', () => {
  let component: UnitProductionPanelComponent;
  let fixture: ComponentFixture<UnitProductionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitProductionPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnitProductionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

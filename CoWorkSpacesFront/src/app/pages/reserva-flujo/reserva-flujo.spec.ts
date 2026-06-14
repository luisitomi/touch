import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaFlujo } from './reserva-flujo';

describe('ReservaFlujo', () => {
  let component: ReservaFlujo;
  let fixture: ComponentFixture<ReservaFlujo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaFlujo],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaFlujo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaReserva } from './consulta-reserva';

describe('ConsultaReserva', () => {
  let component: ConsultaReserva;
  let fixture: ComponentFixture<ConsultaReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaReserva],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaReserva);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

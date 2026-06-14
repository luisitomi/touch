import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcesoPago } from './procceso-pago';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ReservaService } from '../../../core/services/reserva.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('ProcesoPago', () => {
  let component: ProcesoPago;
  let fixture: ComponentFixture<ProcesoPago>;
  let reservaServiceMock: any;
  let dialogRefMock: any;

  beforeEach(async () => {
    reservaServiceMock = {
      confirmarPago: vi.fn().mockReturnValue(of({ status: 'SUCCESS' }))
    };
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ProcesoPago],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: DynamicDialogRef, useValue: dialogRefMock },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { reservaId: 50, precioTotalCalculado: 120.00 } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcesoPago);
    component = fixture.componentInstance;
  });

  it('should process payment and close with success after 3.5s delay', () => {
    vi.useFakeTimers();
    fixture.detectChanges();

    expect(reservaServiceMock.confirmarPago).toHaveBeenCalledWith(50, 120.00);

    vi.advanceTimersByTime(3500);
    expect(dialogRefMock.close).toHaveBeenCalledWith({ exito: true });
    vi.useRealTimers();
  });

  it('should handle error response and close with false after 3.5s delay', () => {
    vi.useFakeTimers();
    reservaServiceMock.confirmarPago.mockReturnValue(throwError(() => new Error('API Error')));

    component.ngOnInit();
    vi.advanceTimersByTime(3500);

    expect(dialogRefMock.close).toHaveBeenCalledWith({ exito: false });
    vi.useRealTimers();
  });
});

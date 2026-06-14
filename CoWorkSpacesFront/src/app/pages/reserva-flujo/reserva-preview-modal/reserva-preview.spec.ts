import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservaPreviewModal } from './reserva-preview-modal';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ReservaService } from '../../../core/services/reserva.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('ReservaPreviewModal', () => {
  let component: ReservaPreviewModal;
  let fixture: ComponentFixture<ReservaPreviewModal>;
  let dialogRefMock: any;
  let reservaServiceMock: any;
  let messageServiceMock: any;

  const mockInputData = {
    espacioId: 5,
    inicio: new Date(2026, 5, 14, 9, 30),
    fin: new Date(2026, 5, 14, 11, 45),
    tarifaBase: 80.00
  };

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };
    reservaServiceMock = {
      cotizarReserva: vi.fn().mockReturnValue(of({
        status: 'SUCCESS',
        data: { precioCalculado: 120.00, reglaAplicada: 'Tarifa Regular' },
        message: '',
        transactionId: ''
      })),
      crearReserva: vi.fn()
    };
    messageServiceMock = { add: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReservaPreviewModal],
      providers: [
        { provide: DynamicDialogRef, useValue: dialogRefMock },
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        {
          provide: DynamicDialogConfig,
          useValue: { data: mockInputData }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaPreviewModal);
    component = fixture.componentInstance;
  });

  it('should create and format input dates and baseline pricing on init', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.fechaFormateada()).toBe('14/06/2026');
    expect(component.horaInicioFormateada()).toBe('09:30');
    expect(component.horaFinFormateada()).toBe('11:45');
    expect(component.tarifaBaseFormateada()).toBe('80.00');
  });

  it('should load dynamic calculated price from backend on init', () => {
    fixture.detectChanges();

    expect(reservaServiceMock.cotizarReserva).toHaveBeenCalledWith(5, '2026-06-14', '09:30:00', '11:45:00');
    expect(component.precioCalculado()).toBe('120.00');
    expect(component.reglaAplicada()).toBe('Tarifa Regular');
    expect(component.cargando()).toBeFalsy();
  });

  it('should close the modal if pricing quote request stream fails', () => {
    reservaServiceMock.cotizarReserva.mockReturnValue(throwError(() => new Error('API Drop')));

    fixture.detectChanges();

    expect(component.cargando()).toBeFalsy();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  it('should send false signal to parent controller when cancel button is pressed', () => {
    fixture.detectChanges();
    component.cancelar();

    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  it('should process payment and return payload to dashboard if reservation creation is successful', () => {
    fixture.detectChanges();
    reservaServiceMock.crearReserva.mockReturnValue(of({
      status: 'SUCCESS',
      data: { reservaId: 442 },
      message: 'Reserva confirmada de forma exitosa.',
      transactionId: ''
    }));

    component.confirmar();

    expect(component.procesandoPago()).toBeFalsy();
    expect(dialogRefMock.close).toHaveBeenCalledWith({
      seleccionado: true,
      message: 'Reserva confirmada de forma exitosa.',
      reservaId: 442,
      precioTotalCalculado: 120
    });
  });
});

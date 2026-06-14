import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaReservaComponent } from './consulta-reserva';
import { ActivatedRoute } from '@angular/router';
import { ReservaService } from '../../core/services/reserva.service';
import { MessageService } from 'primeng/api';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('ConsultaReservaComponent', () => {
  let component: ConsultaReservaComponent;
  let fixture: ComponentFixture<ConsultaReservaComponent>;
  let reservaServiceMock: any;
  let messageServiceMock: any;
  let queryParamsSubject: BehaviorSubject<any>;

  const mockReservaValida = {
    id: 'RES-99',
    codigo: 'RES-99',
    codigoUnicoUuid: '00000000-0000-0000-0000-000000000000',
    espacio: 'Escritorio Premium',
    fecha: '2026-07-15',
    fechaInicio: '2026-07-15T10:00:00',
    fechaFin: '2026-07-15T12:00:00',
    horaInicio: '10:00:00',
    horaFin: '12:00:00',
    fechaCompletaInicio: '2026-07-15T10:00:00',
    fechaCompletaFin: '2026-07-15T12:00:00',
    espacioId: 1,
    nombreEspacio: 'Escritorio Premium',
    titulo: 'Reserva Activa',
    estado: 'CONFIRMADA'
  };

  beforeEach(async () => {
    reservaServiceMock = {
      getDetalleReservaPorCodigo: vi.fn().mockImplementation(() => of({ status: 'SUCCESS', data: mockReservaValida, message: '', transactionId: '' })),
      cancelarReservaId: vi.fn().mockImplementation(() => of({ status: 'SUCCESS', data: null, message: '', transactionId: '' }))
    };
    messageServiceMock = {
      add: vi.fn()
    };
    queryParamsSubject = new BehaviorSubject<any>({});

    await TestBed.configureTestingModule({
      imports: [ConsultaReservaComponent],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParamsSubject.asObservable() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaReservaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load reservation details when code is present in queryParams', () => {
    reservaServiceMock.getDetalleReservaPorCodigo.mockImplementation(() => of({
      status: 'SUCCESS',
      data: mockReservaValida,
      message: '',
      transactionId: ''
    }));

    queryParamsSubject.next({ codigo: 'RES-99' });
    fixture.detectChanges();

    expect(component.codigo()).toBe('RES-99');
    expect(component.reserva()).toEqual(mockReservaValida);
    expect(component.cargando()).toBeFalsy();
  });

  it('should stop loading if no code is present in queryParams', () => {
    queryParamsSubject.next({});
    fixture.detectChanges();

    expect(component.codigo()).toBeNull();
    expect(component.cargando()).toBeFalsy();
  });

  it('should process cancellation successfully and reload data', () => {
    const toastSpy = vi.spyOn(component['messageService'], 'add');

    queryParamsSubject.next({ codigo: 'RES-99' });
    fixture.detectChanges();
    component.reserva.set(mockReservaValida);

    reservaServiceMock.cancelarReservaId.mockImplementation(() => of({
      status: 'SUCCESS',
      data: null,
      message: 'Reserva cancelada con éxito.',
      transactionId: ''
    }));

    component.cancelarReserva();

    expect(component.procesandoCancelacion()).toBeFalsy();
    expect(toastSpy).toHaveBeenCalled();
  });

  it('should show error message if cancellation service fails on backend rules', () => {
    const toastSpy = vi.spyOn(component['messageService'], 'add');

    queryParamsSubject.next({ codigo: 'RES-99' });
    fixture.detectChanges();
    component.reserva.set(mockReservaValida);

    reservaServiceMock.cancelarReservaId.mockImplementation(() => of({
      status: 'ERROR',
      data: null,
      message: 'No se puede cancelar.',
      transactionId: ''
    }));

    component.cancelarReserva();

    expect(component.procesandoCancelacion()).toBeFalsy();
    expect(toastSpy).toHaveBeenCalled();
  });

  it('should turn off processing flag when cancellation stream throws a physical error', () => {
    queryParamsSubject.next({ codigo: 'RES-99' });
    fixture.detectChanges();
    component.reserva.set(mockReservaValida);

    reservaServiceMock.cancelarReservaId.mockImplementation(() => throwError(() => new Error('Timeout Server')));

    component.cancelarReserva();

    expect(component.procesandoCancelacion()).toBeFalsy();
  });

  it('should calculate correct cancellation tier policies based on time window', () => {
    fixture.detectChanges();
    const ahora = new Date();

    const masDe48Horas = new Date(ahora.getTime() + (50 * 60 * 60 * 1000)).toISOString();
    expect(component.obtenerTramoCancelacion(masDe48Horas)).toBe('REEMBOLSO_TOTAL');

    const entre24y48Horas = new Date(ahora.getTime() + (30 * 60 * 60 * 1000)).toISOString();
    expect(component.obtenerTramoCancelacion(entre24y48Horas)).toBe('REEMBOLSO_PARCIAL');

    const menosDe24Horas = new Date(ahora.getTime() + (5 * 60 * 60 * 1000)).toISOString();
    expect(component.obtenerTramoCancelacion(menosDe24Horas)).toBe('PENALIDAD_TOTAL');
  });

  it('should evaluate if a reservation can be cancelled or not', () => {
    fixture.detectChanges();
    const ahora = new Date();

    const fechaFutura = new Date(ahora.getTime() + (72 * 60 * 60 * 1000)).toISOString();
    const fechaInmediata = new Date(ahora.getTime() + (2 * 60 * 60 * 1000)).toISOString();

    expect(component.esCancelable(fechaFutura)).toBeTruthy();
    expect(component.esCancelable(fechaInmediata)).toBeFalsy();
  });
});

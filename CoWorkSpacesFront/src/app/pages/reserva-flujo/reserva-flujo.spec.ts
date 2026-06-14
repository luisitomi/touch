import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservaFlujo } from './reserva-flujo';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ReservaService } from '../../core/services/reserva.service';
import { PLATFORM_ID } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';
import { vi, expect, describe, it, beforeEach } from 'vitest';

describe('ReservaFlujo', () => {
  let component: ReservaFlujo;
  let fixture: ComponentFixture<ReservaFlujo>;
  let reservaServiceMock: any;
  let dialogServiceMock: any;
  let messageServiceMock: any;
  let queryParamsSubject: BehaviorSubject<any>;
  let mockCalendarApi: any;

  beforeEach(async () => {
    reservaServiceMock = {
      getAgendaSemana: vi.fn().mockReturnValue(
        of({
          status: 'SUCCESS',
          data: {
            nombre: 'Sala Premium',
            tarifaBaseHora: 50,
            horaApertura: '08:00:00',
            horaCierre: '18:00:00',
            reservasOcupadas: [],
          },
          message: '',
          transactionId: '',
        }),
      ),
    };

    dialogServiceMock = { open: vi.fn().mockReturnValue({ close: vi.fn(), onClose: of(null) }) };
    messageServiceMock = { add: vi.fn() };
    queryParamsSubject = new BehaviorSubject<any>({});

    mockCalendarApi = {
      getEventById: vi.fn().mockReturnValue({ remove: vi.fn() }),
      addEvent: vi.fn(),
      view: {
        calendar: {
          getEventById: vi.fn().mockReturnValue({ remove: vi.fn() }),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ReservaFlujo],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: DialogService, useValue: dialogServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: queryParamsSubject.asObservable() } },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaFlujo);
    component = fixture.componentInstance;
  });

  it('should create and read query parameter variables', () => {
    queryParamsSubject.next({ espacioId: '3' });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.espacioId()).toBe(3);
    expect(component.opcionesCalendario()).not.toBeNull();
  });

  it('should safely skip calendar initialization if the platform context is SSR server side', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ReservaFlujo],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: DialogService, useValue: mockCalendarApi },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: queryParamsSubject.asObservable() } },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    }).compileComponents();

    const serverFixture = TestBed.createComponent(ReservaFlujo);
    const serverComponent = serverFixture.componentInstance;

    queryParamsSubject.next({ espacioId: '3' });
    serverFixture.detectChanges();

    expect(serverComponent.opcionesCalendario()).toBeNull();
  });

  it('should handle date click workflow and open payment dynamic dialog sequence', async () => {
    queryParamsSubject.next({ espacioId: '3' });
    fixture.detectChanges();
    await fixture.whenStable();

    const fechaInicio = new Date(2030, 5, 15, 10, 0, 0);
    const fechaFin = new Date(2030, 5, 15, 12, 0, 0);

    const spyModal = vi
      .spyOn(component as any, 'abrirModalPreviewPrimeNG')
      .mockImplementation(() => {});

    (component as any).calendarioInstancia = mockCalendarApi;

    const dateClickInfo = {
      date: fechaInicio,
      view: { calendar: mockCalendarApi },
    };

    const opciones = component.opcionesCalendario();
    if (opciones && opciones.dateClick) {
      opciones.dateClick(dateClickInfo as any);
      fixture.detectChanges();

      dateClickInfo.date = fechaFin;
      opciones.dateClick(dateClickInfo as any);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(spyModal).toHaveBeenCalledWith(fechaInicio, fechaFin);
    }
  });
});

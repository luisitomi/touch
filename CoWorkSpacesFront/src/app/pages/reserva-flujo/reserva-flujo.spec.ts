import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservaFlujo } from './reserva-flujo';
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ReservaService } from '../../core/services/reserva.service';
import { PLATFORM_ID } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

describe('ReservaFlujo', () => {
  let component: ReservaFlujo;
  let fixture: ComponentFixture<ReservaFlujo>;
  let reservaServiceMock: any;
  let dialogServiceMock: any;
  let messageServiceMock: any;
  let dialogRefMock: any;
  let queryParamsSubject: BehaviorSubject<any>;
  let mockCalendarApi: any;

  beforeEach(async () => {
    reservaServiceMock = {
      getAgendaSemana: vi.fn().mockReturnValue(of({ status: 'SUCCESS', data: { nombre: '', tarifaBaseHora: 0, horaApertura: '08:00:00', horaCierre: '18:00:00', reservasOcupadas: [] }, message: '', transactionId: '' }))
    };
    dialogServiceMock = { open: vi.fn() };
    messageServiceMock = { add: vi.fn() };
    dialogRefMock = { close: vi.fn(), onClose: of(null) };

    dialogServiceMock.open.mockReturnValue(dialogRefMock);
    queryParamsSubject = new BehaviorSubject<any>({});

    mockCalendarApi = {
      getEventById: vi.fn().mockReturnValue(null),
      addEvent: vi.fn(),
      view: {
        activeStart: new Date('2026-06-14T00:00:00Z'),
        activeEnd: new Date('2026-06-21T00:00:00Z')
      }
    };

    await TestBed.configureTestingModule({
      imports: [ReservaFlujo],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: DialogService, useValue: dialogServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: queryParamsSubject.asObservable() } },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
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
        { provide: DialogService, useValue: dialogServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: queryParamsSubject.asObservable() } },
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const serverFixture = TestBed.createComponent(ReservaFlujo);
    const serverComponent = serverFixture.componentInstance;

    queryParamsSubject.next({ espacioId: '3' });
    serverFixture.detectChanges();

    expect(serverComponent.opcionesCalendario()).toBeNull();
  });
});

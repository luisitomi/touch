import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Landing } from './landing';
import { EspacioService } from '../../core/services/espacio.service';
import { ReservaService } from '../../core/services/reserva.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { vi } from 'vitest';

describe('Landing', () => {
  let component: Landing;
  let fixture: ComponentFixture<Landing>;
  let espacioServiceMock: any;
  let reservaServiceMock: any;
  let routerMock: any;
  let messageServiceMock: any;

  beforeEach(async () => {
    espacioServiceMock = {
      getEspacios: vi.fn().mockReturnValue(of({ status: 'SUCCESS', data: [], message: '', transactionId: '' }))
    };
    reservaServiceMock = {
      getReservaPorCodigo: vi.fn()
    };
    routerMock = {
      navigate: vi.fn()
    };
    messageServiceMock = {
      add: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        { provide: EspacioService, useValue: espacioServiceMock },
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load spaces on init when service returns success', () => {
    const mockEspacios = [
      { id: 1, nombre: 'Sala de Juntas', disponible: true },
      { id: 2, nombre: 'Escritorio Dedicado', disponible: true }
    ];
    espacioServiceMock.getEspacios.mockReturnValue(of({ status: 'SUCCESS', data: mockEspacios, message: '', transactionId: '' }));

    fixture.detectChanges();

    expect(component.espacios()).toEqual(mockEspacios as any);
    expect(component.loading()).toBeFalsy();
    expect(component.error()).toBeNull();
  });

  it('should set error message on init when service returns non-success status', () => {
    espacioServiceMock.getEspacios.mockReturnValue(of({ status: 'ERROR', data: [], message: 'Error de negocio.', transactionId: '' }));

    fixture.detectChanges();

    expect(component.espacios()).toEqual([]);
    expect(component.loading()).toBeFalsy();
    expect(component.error()).toBe('Error de negocio.');
  });

  it('should set error message on init when service stream fails', () => {
    espacioServiceMock.getEspacios.mockReturnValue(throwError(() => new Error('Server Crash')));

    fixture.detectChanges();

    expect(component.espacios()).toEqual([]);
    expect(component.loading()).toBeFalsy();
    expect(component.error()).toBe('Error de comunicación con el servidor de datos.');
  });

  it('should return correct image mapping or fallback default image', () => {
    fixture.detectChanges();
    expect(component.getImagenEspacio(1)).toContain('photo-1497366216548-37526070297c');
    expect(component.getImagenEspacio(99)).toContain('photo-1497366811353-6870744d04b2');
  });

  it('should redirect to reservation details when valid code is found', () => {
    fixture.detectChanges();
    component.codigoBusqueda.set('RES-12345');
    reservaServiceMock.getReservaPorCodigo.mockReturnValue(of({ status: 'SUCCESS', data: { id: 10 }, message: '', transactionId: '' }));

    component.buscarYRedireccionar();

    expect(component.cargandoConsulta()).toBeFalsy();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/consulta-reserva'], { queryParams: { codigo: 'RES-12345' } });
  });

  it('should display warning toast message if code is not found', () => {
    const toastSpy = vi.spyOn(component['messageService'], 'add');

    fixture.detectChanges();
    component.codigoBusqueda.set('RES-NOT-FOUND');
    reservaServiceMock.getReservaPorCodigo.mockReturnValue(of({ status: 'FAIL', data: null, message: 'Not Found', transactionId: '' }));

    component.buscarYRedireccionar();

    expect(component.cargandoConsulta()).toBeFalsy();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalled();
  });

  it('should turn off query loading state even if service execution throws an error', () => {
    fixture.detectChanges();
    component.codigoBusqueda.set('RES-ERROR');
    reservaServiceMock.getReservaPorCodigo.mockReturnValue(throwError(() => new Error('Network Failure')));

    component.buscarYRedireccionar();

    expect(component.cargandoConsulta()).toBeFalsy();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});

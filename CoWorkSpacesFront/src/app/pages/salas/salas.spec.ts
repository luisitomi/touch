import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Salas } from './salas';
import { EspacioService } from '../../core/services/espacio.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('Salas', () => {
  let component: Salas;
  let fixture: ComponentFixture<Salas>;
  let espacioServiceMock: any;

  beforeEach(async () => {
    espacioServiceMock = {
      getEspacios: vi.fn().mockReturnValue(of({
        status: 'SUCCESS',
        data: [],
        message: '',
        transactionId: ''
      }))
    };

    await TestBed.configureTestingModule({
      imports: [Salas],
      providers: [
        { provide: EspacioService, useValue: espacioServiceMock },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Salas);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load spaces cleanly on init when the stream returns valid business data', () => {
    const mockEspacios = [
      { id: 1, nombre: 'Sala Creativa de Innovación', disponible: true },
      { id: 2, nombre: 'Estación de Trabajo Compartida', disponible: true }
    ];
    espacioServiceMock.getEspacios.mockReturnValue(of({
      status: 'SUCCESS',
      data: mockEspacios,
      message: '',
      transactionId: ''
    }));

    fixture.detectChanges();

    expect(component.espacios()).toEqual(mockEspacios as any);
    expect(component.loading()).toBeFalsy();
    expect(component.error()).toBeNull();
  });

  it('should fill the state error message property when data handler returns a non-success flag status', () => {
    espacioServiceMock.getEspacios.mockReturnValue(of({
      status: 'ERROR',
      data: [],
      message: 'Fallo al autenticar.',
      transactionId: ''
    }));

    fixture.detectChanges();

    expect(component.espacios()).toEqual([]);
    expect(component.loading()).toBeFalsy();
    expect(component.error()).toBe('Fallo al autenticar.');
  });

  it('should catch physical network exceptions gracefully and assign safe fallback messages', () => {
    espacioServiceMock.getEspacios.mockReturnValue(throwError(() => new Error('Connection Reset')));

    fixture.detectChanges();

    expect(component.espacios()).toEqual([]);
    expect(component.loading()).toBeFalsy();
    expect(component.error()).toBe('Error de comunicación con el servidor de datos.');
  });

  it('should return correct image resource path URL or trigger fallback asset if key does not match', () => {
    fixture.detectChanges();
    expect(component.getImagenEspacio(2)).toContain('photo-1517502884422-41eaead166d4');
    expect(component.getImagenEspacio(999)).toContain('photo-1497366811353-6870744d04b2');
  });
});

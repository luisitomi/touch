import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ReservaService } from '../../../core/services/reserva.service';

@Component({
  selector: 'app-reserva-preview-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, InputTextModule],
  templateUrl: './reserva-preview-modal.html',
  styleUrl: './reserva-preview-modal.scss',
})
export class ReservaPreviewModal implements OnInit {
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private reservaService = inject(ReservaService);
  private messageService = inject(MessageService);

  public cargando = signal<boolean>(true);
  public procesandoPago = signal<boolean>(false);
  public precioCalculado = signal<string>('0.00');
  public tarifaBaseFormateada = signal<string>('0.00');
  public reglaAplicada = signal<string>('');

  public fechaFormateada = signal<string>('');
  public horaInicioFormateada = signal<string>('');
  public horaFinFormateada = signal<string>('');

  datosEntrada = this.config.data;
  private cadenasEnvio = { fecha: '', inicio: '', fin: '' };

  ngOnInit(): void {
    this.formatearDatosVisuales();
    this.consultarPrecioServidor();
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  private formatearDatosVisuales(): void {
    const inicio: Date = this.datosEntrada.inicio;
    const fin: Date = this.datosEntrada.fin;

    this.fechaFormateada.set(
      `${this.pad(inicio.getDate())}/${this.pad(inicio.getMonth() + 1)}/${inicio.getFullYear()}`,
    );
    this.horaInicioFormateada.set(
      `${this.pad(inicio.getHours())}:${this.pad(inicio.getMinutes())}`,
    );
    this.horaFinFormateada.set(`${this.pad(fin.getHours())}:${this.pad(fin.getMinutes())}`);

    const tarifaNum = Number(this.datosEntrada.tarifaBase) || 0;
    this.tarifaBaseFormateada.set(tarifaNum.toFixed(2));

    this.cadenasEnvio.fecha = `${inicio.getFullYear()}-${this.pad(inicio.getMonth() + 1)}-${this.pad(inicio.getDate())}`;
    this.cadenasEnvio.inicio = `${this.pad(inicio.getHours())}:${this.pad(inicio.getMinutes())}:00`;
    this.cadenasEnvio.fin = `${this.pad(fin.getHours())}:${this.pad(fin.getMinutes())}:00`;
  }

  private consultarPrecioServidor(): void {
    this.reservaService
      .cotizarReserva(
        this.datosEntrada.espacioId,
        this.cadenasEnvio.fecha,
        this.cadenasEnvio.inicio,
        this.cadenasEnvio.fin,
      )
      .subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS' && response.data) {
            const precioNum = Number(response.data.precioCalculado) || 0;
            this.precioCalculado.set(precioNum.toFixed(2));
            this.reglaAplicada.set(response.data.reglaAplicada);
            this.cargando.set(false);
          }
        },
        error: (err) => {
          this.cargando.set(false);
          this.ref.close(false);
        },
      });
  }

  public cancelar(): void {
    this.ref.close(false);
  }

  public confirmar(): void {
    if (this.procesandoPago()) return;

    this.procesandoPago.set(true);

    this.reservaService
      .crearReserva(
        this.datosEntrada.espacioId,
        this.cadenasEnvio.fecha,
        this.cadenasEnvio.inicio,
        this.cadenasEnvio.fin,
      )
      .subscribe({
        next: (response) => {
          this.procesandoPago.set(false);
          if (response.status === 'SUCCESS') {
            this.ref.close({ seleccionado: true, message: response.message });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error en la Operación',
              detail: response.message || 'No se pudo completar el pago.',
              life: 5000
            });
          }
        },
        error: (err) => {
          this.procesandoPago.set(false);
          this.ref.close(false);
        },
      });
  }
}

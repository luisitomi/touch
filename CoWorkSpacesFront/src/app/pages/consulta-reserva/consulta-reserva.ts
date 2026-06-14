import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReservaService } from '../../core/services/reserva.service';

@Component({
  selector: 'app-consulta-reserva',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './consulta-reserva.html',
  styleUrl: './consulta-reserva.scss',
})
export class ConsultaReservaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reservaService = inject(ReservaService);
  private messageService = inject(MessageService);

  public codigo = signal<string | null>(null);
  public cargando = signal<boolean>(true);
  public procesandoCancelacion = signal<boolean>(false);
  public reserva = signal<any | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['codigo']) {
        this.codigo.set(params['codigo']);
        this.cargarDatosReserva(params['codigo']);
      } else {
        this.cargando.set(false);
      }
    });
  }

  private cargarDatosReserva(codigo: string): void {
    this.reservaService.getDetalleReservaPorCodigo(codigo).subscribe({
      next: (response) => {
        this.cargando.set(false);
        if (response.status === 'SUCCESS' && response.data) {
          this.reserva.set(response.data);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  public cancelarReserva(): void {
    if (!this.reserva() || this.procesandoCancelacion()) return;

    this.procesandoCancelacion.set(true);
    const id = this.reserva().codigo;

    this.reservaService.cancelarReservaId(id).subscribe({
      next: (response) => {
        this.procesandoCancelacion.set(false);
        if (response.status === 'SUCCESS') {
          this.messageService.add({
            severity: 'success',
            summary: 'Cancelación Exitosa',
            detail: response.message || 'La reserva se canceló correctamente.',
          });
          this.cargarDatosReserva(this.codigo()!);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message,
          });
        }
      },
      error: () => this.procesandoCancelacion.set(false),
    });
  }
  public obtenerTramoCancelacion(
    fechaCompletaInicio: string,
  ): 'REEMBOLSO_TOTAL' | 'REEMBOLSO_PARCIAL' | 'PENALIDAD_TOTAL' {
    if (!fechaCompletaInicio) return 'PENALIDAD_TOTAL';

    const ahora = new Date();
    const fechaInicioReserva = new Date(fechaCompletaInicio);

    const diferenciaMilisegundos = fechaInicioReserva.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMilisegundos / (1000 * 60 * 60);

    if (diferenciaHoras >= 48) {
      return 'REEMBOLSO_TOTAL';
    } else if (diferenciaHoras >= 24 && diferenciaHoras < 48) {
      return 'REEMBOLSO_PARCIAL';
    } else {
      return 'PENALIDAD_TOTAL';
    }
  }

  public esCancelable(fechaCompletaInicio: string): boolean {
    return this.obtenerTramoCancelacion(fechaCompletaInicio) !== 'PENALIDAD_TOTAL';
  }
}

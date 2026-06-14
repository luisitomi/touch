import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ReservaService } from '../../../core/services/reserva.service';

@Component({
  selector: 'app-proceso-pago',
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './procceso-pago.html',
  styleUrls: ['./procceso-pago.scss']
})
export class ProcesoPago implements OnInit {
  private reservaService = inject(ReservaService);
  private config = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);

  ngOnInit(): void {
    const reservaId = this.config.data?.reservaId;
    const precioTotalCalculado = this.config.data?.precioTotalCalculado || 0;

    if (reservaId) {
      this.procesarPagoAutomatico(reservaId, precioTotalCalculado);
    } else {
      this.dialogRef.close({ exito: false });
    }
  }

  private procesarPagoAutomatico(id: number, precio: number): void {
    this.reservaService.confirmarPago(id, precio).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS') {
          setTimeout(() => {
            this.dialogRef.close({ exito: true });
          }, 3500);
        } else {
          setTimeout(() => {
            this.dialogRef.close({ exito: false });
          }, 3500);
        }
      },
      error: () => {
        setTimeout(() => {
          this.dialogRef.close({ exito: false });
        }, 3500);
      }
    });
  }
}

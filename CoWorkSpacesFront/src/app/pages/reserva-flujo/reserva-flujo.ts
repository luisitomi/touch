import { Component, OnInit, inject, signal, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ReservaService } from '../../core/services/reserva.service';
import { ReservaPreviewModal } from './reserva-preview-modal/reserva-preview-modal';
import { ToastModule } from 'primeng/toast';
import { ProcesoPago } from './procceso-pago/procceso-pago';

@Component({
  selector: 'app-reserva-flujo',
  standalone: true,
  imports: [CommonModule, RouterLink, FullCalendarModule, ToastModule, ProcesoPago],
  providers: [DialogService, MessageService],
  templateUrl: './reserva-flujo.html',
  styleUrl: './reserva-flujo.scss',
  encapsulation: ViewEncapsulation.None
})
export class ReservaFlujo implements OnInit {
  private route = inject(ActivatedRoute);
  private reservaService = inject(ReservaService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private platformId = inject(PLATFORM_ID);

  private dialogRef?: DynamicDialogRef<ReservaPreviewModal> | null = null;
  private dialogRef1?: DynamicDialogRef<ProcesoPago> | null = null;
  private calendarioInstancia: any = null;

  public espacioId = signal<number | null>(null);
  public opcionesCalendario = signal<CalendarOptions | null>(null);
  public nombreEspacio = signal<string>('');
  public precioEspacio = signal<number>(0);

  private ultimoInicio: string = '';
  private ultimoFin: string = '';
  private horaInicioSeleccionada: Date | null = null;
  private eventosServidor: any[] = [];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.route.queryParams.subscribe((params) => {
      if (params['espacioId']) {
        this.espacioId.set(Number(params['espacioId']));
        this.inicializarCalendario();
      }
    });
  }

  private inicializarCalendario(): void {
    const ahora = new Date();

    this.opcionesCalendario.set({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      locale: 'es',
      buttonText: {
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        list: 'Agenda',
      },
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,timeGridDay',
      },
      allDaySlot: false,
      selectable: false,
      slotDuration: '01:00:00',
      snapDuration: '01:00:00',
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
      expandRows: true,
      height: 'auto',

      dateClick: (info) => {
        if (info.date < ahora) return;
        this.calendarioInstancia = info.view.calendar;
        this.procesarSeleccionPorClicks(info.date, this.calendarioInstancia);
      },

      datesSet: (info: DatesSetArg) => {
        this.calendarioInstancia = info.view.calendar;
        const queryInicio = info.start.toISOString().split('T')[0];

        const fechaFinCalculada = new Date(info.end);
        fechaFinCalculada.setDate(fechaFinCalculada.getDate() - 1);
        const queryFin = fechaFinCalculada.toISOString().split('T')[0];

        this.cargarDataAgendaSemanal(queryInicio, queryFin);
      },
    });
  }

  private procesarSeleccionPorClicks(fechaSeleccionada: Date, calendarioApi: any): void {
    const eventoExistente = calendarioApi.getEventById('seleccion-temporal');

    if (!this.horaInicioSeleccionada) {
      this.horaInicioSeleccionada = fechaSeleccionada;

      if (eventoExistente) {
        eventoExistente.remove();
      }

      const finBloque1Hora = new Date(fechaSeleccionada.getTime() + 60 * 60 * 1000);

      calendarioApi.addEvent({
        id: 'seleccion-temporal',
        title: 'Inicia aquí...',
        start: fechaSeleccionada.toISOString(),
        end: finBloque1Hora.toISOString(),
        className: 'evento-temporal-seleccion',
        display: 'block',
        editable: false,
      });
    } else {
      const inicio = this.horaInicioSeleccionada;
      let fin: Date;

      if (fechaSeleccionada.getTime() === inicio.getTime()) {
        fin = new Date(fechaSeleccionada.getTime() + 60 * 60 * 1000);
      } else {
        fin = new Date(fechaSeleccionada.getTime());
      }

      this.horaInicioSeleccionada = null;

      if (eventoExistente) {
        eventoExistente.remove();
      }

      if (fin <= inicio) {
        this.horaInicioSeleccionada = fechaSeleccionada;

        const nuevoFinBloque = new Date(fechaSeleccionada.getTime() + 60 * 60 * 1000);

        calendarioApi.addEvent({
          id: 'seleccion-temporal',
          title: 'Inicia aquí...',
          start: fechaSeleccionada.toISOString(),
          end: nuevoFinBloque.toISOString(),
          className: 'evento-temporal-seleccion',
          display: 'block',
          editable: false,
        });
        return;
      }

      this.abrirModalPreviewPrimeNG(inicio, fin);
    }
  }

  private abrirModalPreviewPrimeNG(inicio: Date, fin: Date): void {
    this.dialogRef = this.dialogService.open(ReservaPreviewModal, {
      header: 'Vista Previa de Cotización',
      width: '450px',
      modal: true,
      closable: true,
      dismissableMask: true,
      styleClass: 'custom-white-modal',
      contentStyle: { background: '#ffffff', padding: '0' },
      data: {
        espacioId: this.espacioId()!,
        nombreEspacio: this.nombreEspacio(),
        tarifaBase: this.precioEspacio(),
        inicio: inicio,
        fin: fin,
      },
    });

    this.dialogRef?.onClose.subscribe((resultado: any) => {
      if (resultado && resultado.seleccionado && this.calendarioInstancia) {
        const eventoTemp = this.calendarioInstancia.getEventById('seleccion-temporal');
        if (eventoTemp) {
          eventoTemp.remove();
        }

        this.ultimoInicio = '';
        this.ultimoFin = '';

        if (resultado.reservaId) {
          this.abrirModalPagoAutomatico(resultado.reservaId, resultado.precioTotalCalculado);
        } else {
          this.refrescarCalendario();
        }
      } else if (this.calendarioInstancia) {
        const eventoTemp = this.calendarioInstancia.getEventById('seleccion-temporal');
        if (eventoTemp) {
          eventoTemp.remove();
        }
      }
    });
  }

  private abrirModalPagoAutomatico(reservaId: number, precioTotalCalculado: number): void {
    this.dialogRef1 = this.dialogService.open(ProcesoPago, {
      header: 'Procesando Transacción',
      width: '400px',
      modal: true,
      closable: false,
      dismissableMask: false,
      styleClass: 'custom-payment-modal',
      data: {
        reservaId: reservaId,
        precioTotalCalculado: precioTotalCalculado,
      }
    });

    this.dialogRef1?.onClose.subscribe(() => {
      this.refrescarCalendario();
    });
  }

  private refrescarCalendario(): void {
    if (!this.calendarioInstancia) return;

    const vistaActual = this.calendarioInstancia.view;
    const queryInicio = vistaActual.activeStart.toISOString().split('T')[0];

    const fechaFinCalculada = new Date(vistaActual.activeEnd);
    fechaFinCalculada.setDate(fechaFinCalculada.getDate() - 1);
    const queryFin = fechaFinCalculada.toISOString().split('T')[0];

    this.cargarDataAgendaSemanal(queryInicio, queryFin);
  }

  private cargarDataAgendaSemanal(inicioSemana: string, finSemana: string): void {
    const id = this.espacioId();
    if (!id) return;

    if (this.ultimoInicio === inicioSemana && this.ultimoFin === finSemana) {
      return;
    }

    this.ultimoInicio = inicioSemana;
    this.ultimoFin = finSemana;

    this.reservaService.getAgendaSemana(id, inicioSemana, finSemana).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS' && response.data) {
          const info = response.data;

          this.nombreEspacio.set(info.nombre);
          this.precioEspacio.set(info.tarifaBaseHora);

          this.eventosServidor = info.reservasOcupadas.map((res) => ({
            title: res.titulo,
            start: res.fechaInicio,
            end: res.fechaFin,
            className: 'evento-ocupado',
            editable: false,
          }));

          const opcionesActuales = this.opcionesCalendario();
          if (opcionesActuales) {
            let horaCierreAjustada = info.horaCierre;
            if (horaCierreAjustada === '00:00:00') {
              horaCierreAjustada = '24:00:00';
            }

            this.opcionesCalendario.set({
              ...opcionesActuales,
              slotMinTime: info.horaApertura,
              slotMaxTime: horaCierreAjustada,
              events: [...this.eventosServidor],
            });
          }
        }
      },
    });
  }
}

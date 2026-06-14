import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { Espacio } from '../../core/models/espacio.model';
import { ReservaService } from '../../core/services/reserva.service';
import { EspacioService } from '../../core/services/espacio.service';
import { ReporteService } from '../../core/services/reporte.service';
import { ReporteDashboard } from '../../core/models/reporte-dashboard.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    ChartModule,
    DatePickerModule
  ],
  providers: [MessageService],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing implements OnInit {
  private espacioService = inject(EspacioService);
  private reservaService = inject(ReservaService);
  private reporteService = inject(ReporteService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  public espacios = signal<Espacio[]>([]);
  public loading = signal<boolean>(true);
  public error = signal<string | null>(null);

  public codigoBusqueda = signal<string>('');
  public cargandoConsulta = signal<boolean>(false);

  public fechaDesdeFiltro = signal<Date>(new Date());
  public fechaHastaFiltro = signal<Date>(new Date(new Date().setMonth(new Date().getMonth() + 1)));

  public reporteData = signal<ReporteDashboard | null>(null);
  public cargandoReporte = signal<boolean>(true);
  public chartOcupacionData = signal<any>({ labels: [], datasets: [] });
  public chartIngresosData = signal<any>({ labels: [], datasets: [] });
  public chartOptions = signal<any>({});

  private imagenesEspacios: Record<number, string> = {
    1: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
    2: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=600&auto=format&fit=crop',
    3: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop'
  };

  private imagenPorDefecto = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=600&auto=format&fit=crop';

  ngOnInit(): void {
    this.espacioService.getEspacios().subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS') {
          this.espacios.set(response.data);
        } else {
          this.error.set(response.message);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error de comunicación con el servidor de datos.');
        this.loading.set(false);
      }
    });

    this.cargarEstadisticasDashboard();
  }

  public getImagenEspacio(id: number): string {
    return this.imagenesEspacios[id] || this.imagenPorDefecto;
  }

  public buscarYRedireccionar(): void {
    const codigo = this.codigoBusqueda().trim();
    if (!codigo) return;

    this.cargandoConsulta.set(true);

    this.reservaService.getReservaPorCodigo(codigo).subscribe({
      next: (response) => {
        this.cargandoConsulta.set(false);
        if (response.status === 'SUCCESS' && response.data) {
          this.router.navigate(['/consulta-reserva'], { queryParams: { codigo: codigo } });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Encontrado',
            detail: 'No existe ninguna reserva con el código ingresado.'
          });
        }
      },
      error: () => this.cargandoConsulta.set(false)
    });
  }

  public cargarEstadisticasDashboard(): void {
    this.cargandoReporte.set(true);

    const desdeStr = this.fechaDesdeFiltro().toISOString().split('T')[0];
    const hastaStr = this.fechaHastaFiltro().toISOString().split('T')[0];

    this.reporteService.obtenerReporte(desdeStr, hastaStr).subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS' && response.data) {
          const data = response.data;
          this.reporteData.set(data);
          this.configurarOpcionesGraficos();
          this.armarGraficoOcupacion(data.reportePorEspacio);
          this.armarGraficoIngresos(data.reportePorEspacio);
        }
        this.cargandoReporte.set(false);
      },
      error: () => this.cargandoReporte.set(false)
    });
  }

  private configurarOpcionesGraficos(): void {
    this.chartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#94a3b8',
            font: { size: 12, family: 'system-ui' }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        }
      }
    });
  }

  private armarGraficoOcupacion(lista: any[]): void {
    this.chartOcupacionData.set({
      labels: lista.map(x => x.nombreEspacio),
      datasets: [{
        label: 'Tasa de Ocupación (%)',
        data: lista.map(x => x.tasaOcupacionPorcentaje),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6
      }]
    });
  }

  private armarGraficoIngresos(lista: any[]): void {
    this.chartIngresosData.set({
      labels: lista.map(x => x.nombreEspacio),
      datasets: [{
        data: lista.map(x => x.ingresosPorEspacio),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec407a'],
        borderWidth: 0
      }]
    });
  }
}

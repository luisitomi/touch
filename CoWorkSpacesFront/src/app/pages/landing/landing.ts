import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Espacio } from '../../core/models/espacio.model';
import { ReservaService } from '../../core/services/reserva.service';
import { EspacioService } from '../../core/services/espacio.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing implements OnInit {
  private espacioService = inject(EspacioService);
  private reservaService = inject(ReservaService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  public espacios = signal<Espacio[]>([]);
  public loading = signal<boolean>(true);
  public error = signal<string | null>(null);

  public codigoBusqueda = signal<string>('');
  public cargandoConsulta = signal<boolean>(false);

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
}

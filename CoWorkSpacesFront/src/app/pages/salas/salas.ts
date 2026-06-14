import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EspacioService } from '../../core/services/espacio.service';
import { Espacio } from '../../core/models/espacio.model';

@Component({
  selector: 'app-salas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './salas.html',
  styleUrls: ['./salas.scss']
})
export class Salas implements OnInit {
  private espacioService = inject(EspacioService);

  public espacios = signal<Espacio[]>([]);
  public loading = signal<boolean>(true);
  public error = signal<string | null>(null);

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
}

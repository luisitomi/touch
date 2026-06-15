import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
  },
  {
    path: 'salas',
    loadComponent: () => import('./pages/salas/salas').then(m => m.Salas)
  },
  {
    path: 'salas/crear',
    loadComponent: () => import('./pages/crear-espacio/crear-espacio.component').then(m => m.CrearEspacioComponent)
  },
  {
    path: 'reservar',
    loadComponent: () => import('./pages/reserva-flujo/reserva-flujo').then(m => m.ReservaFlujo)
  },
  {
    path: 'consulta-reserva',
    loadComponent: () => import('./pages/consulta-reserva/consulta-reserva').then(m => m.ConsultaReservaComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensajeDetalle = '';

      switch (error.status) {
        case 409:
          mensajeDetalle = '¡Lo sentimos! Este horario acaba de ser reservado por otro usuario.';
          break;
        case 400:
          mensajeDetalle = error?.error?.message;
          break;
        case 422:
          mensajeDetalle =
            'Los datos de la reserva no son válidos o están fuera de los parámetros.';
          break;
        case 404:
          mensajeDetalle = 'El recurso solicitado no existe o está fuera del horario permitido.';
          break;
        case 500:
          mensajeDetalle = 'Hubo un error interno en el servidor. Por favor, inténtalo más tarde.';
          break;
        default:
          mensajeDetalle = 'Ocurrió un problema inesperado en la comunicación.';
          break;
      }

      messageService.add({
        severity: 'error',
        summary: 'Error en la Operación',
        detail: mensajeDetalle,
        life: 6000,
      });

      return throwError(() => error);
    }),
  );
};

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Response } from '../models/response.model';
import { AgendaEspacio } from '../models/agenda.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservas`;

  public getAgendaSemana(
    espacioId: number,
    fechaInicio: string,
    fechaFin: string,
  ): Observable<Response<AgendaEspacio>> {
    const body = {
      espacioId,
      fechaInicio,
      fechaFin,
    };

    return this.http.post<Response<AgendaEspacio>>(`${this.apiUrl}/agenda`, body);
  }

  public cotizarReserva(
    espacioId: number,
    fechaReserva: string,
    horaInicio: string,
    horaFin: string,
  ): Observable<Response<{ precioCalculado: number; reglaAplicada: string }>> {
    const body = {
      espacioId,
      fecha: fechaReserva,
      horaInicio,
      horaFin,
    };

    return this.http.post<Response<{ precioCalculado: number; reglaAplicada: string }>>(
      `${this.apiUrl}/preview-tarifa`,
      body,
    );
  }

  public crearReserva(
    espacioId: number,
    fechaReserva: string,
    horaInicio: string,
    horaFin: string,
  ): Observable<Response<any>> {
    const body = { espacioId, fecha: fechaReserva, horaInicio, horaFin };
    return this.http.post<Response<any>>(`${this.apiUrl}`, body);
  }

  public getReservaPorCodigo(codigo: string): Observable<Response<any>> {
    return this.http.get<Response<any>>(`${this.apiUrl}/buscar/${codigo}`);
  }

  public getDetalleReservaPorCodigo(codigo: string): Observable<Response<any>> {
    return this.http.get<Response<any>>(`${this.apiUrl}/detalle/${codigo}`);
  }

  public cancelarReservaId(reservaId: string): Observable<Response<any>> {
    return this.http.post<Response<any>>(`${this.apiUrl}/cancelar/${reservaId}`, {});
  }
}

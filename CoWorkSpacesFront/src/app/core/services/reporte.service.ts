import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { Response } from '../models/response.model';
import { ReporteDashboard } from '../models/reporte-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reportes/dashboard`;

  obtenerReporte(fechaDesde: string, fechaHasta: string): Observable<Response<ReporteDashboard>> {
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);

    return this.http.get<Response<ReporteDashboard>>(this.apiUrl, { params });
  }
}

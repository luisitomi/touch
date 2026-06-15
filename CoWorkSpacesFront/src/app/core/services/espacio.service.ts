import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../models/response.model';
import { Espacio } from '../models/espacio.model';
import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { EspacioRequest } from '../models/espacio.request.model';
import { EspacioResponse } from '../models/espacio.response.model';

@Injectable({
  providedIn: 'root'
})
export class EspacioService {
  readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}/espacios`;

  getEspacios(): Observable<Response<Espacio[]>> {
    return this.http.get<Response<Espacio[]>>(this.apiUrl);
  }

  crearEspacio(espacio: EspacioRequest): Observable<Response<EspacioResponse>> {
    return this.http.post<Response<EspacioResponse>>(this.apiUrl, espacio);
  }
}

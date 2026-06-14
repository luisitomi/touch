import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '../models/response.model';
import { Espacio } from '../models/espacio.model';
import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EspacioService {
  readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}/espacios`;

  getEspacios(): Observable<Response<Espacio[]>> {
    return this.http.get<Response<Espacio[]>>(this.apiUrl);
  }
}

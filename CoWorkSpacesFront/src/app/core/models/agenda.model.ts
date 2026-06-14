import { ReservaOcupada } from "./reserva-ocupada.model";

export interface AgendaEspacio {
  espacioId: number;
  nombre: string;
  tarifaBaseHora: number;
  horaApertura: string;
  horaCierre: string;
  reservasOcupadas: ReservaOcupada[];
}

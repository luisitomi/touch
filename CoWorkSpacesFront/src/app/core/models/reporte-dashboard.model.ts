import { ReporteEspacio } from "./reporte-espacio.model";

export interface ReporteDashboard {
  ingresosTotalesGlobales: number;
  horaMasDemandada: string;
  reportePorEspacio: ReporteEspacio[];
}

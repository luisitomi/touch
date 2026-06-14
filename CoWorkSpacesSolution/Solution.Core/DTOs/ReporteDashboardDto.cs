namespace Solution.Core.DTOs
{
    public class ReporteDashboardDto
    {
        public decimal IngresosTotalesGlobales { get; set; }
        public TimeSpan HoraMasDemandada { get; set; }
        public List<ReporteEspacioDto> ReportePorEspacio { get; set; } = new();
    }
}

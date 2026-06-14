using Solution.Core.DTOs;

namespace Solution.Infrastructure.Interfaces
{
    public interface IReporteRepository
    {
        Task<ReporteDashboardDto> ObtenerReporteDashboardAsync(DateTime fechaDesde, DateTime fechaHasta);
    }
}
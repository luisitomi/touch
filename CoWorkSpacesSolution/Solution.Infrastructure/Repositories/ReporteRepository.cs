using Dapper;
using Solution.Core.DTOs;
using Solution.Infrastructure.Interfaces;
using System.Data;

namespace Solution.Infrastructure.Repositories
{
    public class ReporteRepository : IReporteRepository
    {
        private readonly IDbConnection _connection;
        private readonly IUnitOfWork _uow;

        public ReporteRepository(IDbConnection connection, IUnitOfWork uow)
        {
            _connection = connection;
            _uow = uow;
        }

        public async Task<ReporteDashboardDto> ObtenerReporteDashboardAsync(DateTime fechaDesde, DateTime fechaHasta)
        {
            var reporte = new ReporteDashboardDto();
            string query = "negocio.sp_GetReporteDashboard";

            var parametros = new
            {
                FechaDesde = fechaDesde,
                FechaHasta = fechaHasta
            };

            using var multi = await _connection.QueryMultipleAsync(
                query,
                parametros,
                transaction: _uow.Transaction,
                commandType: CommandType.StoredProcedure
            );

            reporte.ReportePorEspacio = (await multi.ReadAsync<ReporteEspacioDto>()).ToList();
            reporte.IngresosTotalesGlobales = await multi.ReadFirstAsync<decimal>();

            var horarioAux = await multi.ReadFirstOrDefaultAsync<HorarioDemandadoAuxDto>();
            if (horarioAux != null)
            {
                reporte.HoraMasDemandada = horarioAux.HoraMasDemandada;
            }

            return reporte;
        }
    }
}
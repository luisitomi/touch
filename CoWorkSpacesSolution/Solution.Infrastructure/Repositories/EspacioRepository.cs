using Dapper;
using Solution.Core.DTOs;
using Solution.Infrastructure.Interfaces;
using System.Data;
using WebApi.Dtos;

namespace Solution.Infrastructure.Repositories
{
    public class EspacioRepository : IEspacioRepository
    {
        private readonly IDbConnection _connection;
        private readonly IUnitOfWork _uow;

        public EspacioRepository(IDbConnection connection, IUnitOfWork uow)
        {
            _connection = connection;
            _uow = uow;
        }

        public async Task<IEnumerable<EspacioDto>> ListarActivosAsync()
        {
            string query = "negocio.sp_ListarEspaciosActivos";

            return await _connection.QueryAsync<EspacioDto>(
                query,
                commandType: CommandType.StoredProcedure,
                transaction: _uow.Transaction
            );
        }

        public async Task<EspacioResponseDto> InsertarEspacioAsync(EspacioRequestDto dto)
        {
            string storedProcedure = "negocio.sp_InsertarEspacio";

            var parametros = new DynamicParameters();
            parametros.Add("@Nombre", dto.Nombre);
            parametros.Add("@Capacidad", dto.Capacidad);
            parametros.Add("@TarifaBaseHora", dto.TarifaBaseHora);
            parametros.Add("@HorarioApertura", dto.HorarioApertura);
            parametros.Add("@HorarioCierre", dto.HorarioCierre);

            return await _connection.QueryFirstOrDefaultAsync<EspacioResponseDto>(
                storedProcedure,
                parametros,
                commandType: CommandType.StoredProcedure,
                transaction: _uow.Transaction
            ) ?? new EspacioResponseDto { Status = "ERROR", Message = "No se obtuvo respuesta del servidor." };
        }
    }
}
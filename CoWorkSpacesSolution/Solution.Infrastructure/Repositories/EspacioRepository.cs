using Dapper;
using Solution.Core.DTOs;
using Solution.Infrastructure.Interfaces;
using System.Data;

namespace Solution.Infrastructure.Repositories;

public class EspacioRepository : IEspacioRepository
{
    private readonly IDbConnection _connection;
    private readonly IUnitOfWork _uow;

    public EspacioRepository(IDbConnection connection, IUnitOfWork _uow)
    {
        _connection = connection;
        this._uow = _uow;
    }

    public async Task<IEnumerable<EspacioDto>> ListarActivosAsync()
    {
        string query = "negocio.sp_ListarEspaciosActivos";

        return await _connection.QueryAsync<EspacioDto>(
            query,
            transaction: _uow.Transaction
        );
    }
}
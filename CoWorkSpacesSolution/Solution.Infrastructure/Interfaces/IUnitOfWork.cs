using System.Data;

namespace Solution.Infrastructure.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IReservaRepository Reservas { get; }
    IEspacioRepository Espacios { get; }
    IReporteRepository Reporte { get; }
    IDbConnection Connection { get; }
    IDbTransaction? Transaction { get; }
    void BeginTransaction();
    void Commit();
    void Rollback();
}
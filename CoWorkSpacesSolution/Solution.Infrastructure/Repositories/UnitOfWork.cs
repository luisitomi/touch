using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Solution.Infrastructure.Interfaces;
using Solution.Infrastructure.Repositories;
using System.Data;

namespace Solution.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly IDbConnection _connection;
    private IDbTransaction? _transaction;
    private IReservaRepository? _reservas;
    private IEspacioRepository? _espacios;

    public UnitOfWork(IConfiguration configuration)
    {
        string connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new global::System.ArgumentNullException("La cadena de conexión 'DefaultConnection' no está configurada.");

        _connection = new SqlConnection(connectionString);
        _connection.Open();
    }

    public IDbConnection Connection => _connection;
    public IDbTransaction? Transaction => _transaction;

    public IReservaRepository Reservas => _reservas ??= new ReservaRepository(_connection, this);
    public IEspacioRepository Espacios => _espacios ??= new EspacioRepository(_connection, this);

    public void BeginTransaction()
    {
        if (_transaction == null)
        {
            _transaction = _connection.BeginTransaction();
        }
    }

    public void Commit()
    {
        try
        {
            _transaction?.Commit();
        }
        catch
        {
            Rollback();
            throw;
        }
        finally
        {
            DisposeTransaction();
        }
    }

    public void Rollback()
    {
        _transaction?.Rollback();
        DisposeTransaction();
    }

    private void DisposeTransaction()
    {
        _transaction?.Dispose();
        _transaction = null;
    }

    public void Dispose()
    {
        DisposeTransaction();
        if (_connection.State != ConnectionState.Closed)
        {
            _connection.Close();
        }
        _connection.Dispose();
    }
}
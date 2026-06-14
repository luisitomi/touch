using CoWorkSpacesSolution.Application.DTOs;
using Dapper;
using Microsoft.Data.SqlClient;
using Solution.Common;
using Solution.Common.Exception;
using Solution.Core.DTOs;
using Solution.Infrastructure.Interfaces;
using System.Data;

namespace Solution.Infrastructure.Repositories;

public class ReservaRepository : IReservaRepository
{
    private readonly IDbConnection _connection;
    private readonly IUnitOfWork _uow;

    public ReservaRepository(IDbConnection connection, IUnitOfWork uow)
    {
        _connection = connection;
        _uow = uow;
    }

    public async Task<ReservaDetalleDto> ObtenerDetalleReservaPorUuidAsync(Guid codigoUnicoUuid)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@CodigoUnicoUuid", codigoUnicoUuid, DbType.Guid);

        try
        {
            var reserva = await _connection.QueryFirstOrDefaultAsync<ReservaDetalleDto>(
                "negocio.usp_ObtenerDetalleReservaPorUuid",
                parametros,
                transaction: _uow.Transaction,
                commandType: CommandType.StoredProcedure
            );

            if (reserva == null)
            {
                throw new FunctionalException("NOT_FOUND_404", "La reserva solicitada no existe en el sistema.");
            }

            return reserva;
        }
        catch (SqlException ex) when (ex.Message.Contains("no existe"))
        {
            throw new FunctionalException("NOT_FOUND_404", "La reserva solicitada no existe en el sistema.");
        }
    }

    public async Task<ReservaConsultaDto> VerificarReservaPorUuidAsync(Guid codigoUnicoUuid)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@CodigoUnicoUuid", codigoUnicoUuid, DbType.Guid);

        try
        {
            var reserva = await _connection.QueryFirstOrDefaultAsync<ReservaConsultaDto>(
                "negocio.usp_VerificarReservaPorUuid",
                parametros,
                transaction: _uow.Transaction,
                commandType: CommandType.StoredProcedure
            );

            if (reserva == null)
            {
                throw new FunctionalException("NOT_FOUND_404", "La reserva solicitada no existe en el sistema.");
            }

            return reserva;
        }
        catch (SqlException ex) when (ex.Message.Contains("no existe"))
        {
            throw new FunctionalException("NOT_FOUND_404", "La reserva solicitada no existe en el sistema.");
        }
    }

    public async Task<ReservaResponseDto> CrearReservaAsync(CrearReservaDto dto)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@EspacioId", dto.EspacioId, DbType.Int32);
        parametros.Add("@FechaReserva", dto.Fecha, DbType.Date);
        parametros.Add("@HoraInicio", dto.HoraInicio, DbType.Time);
        parametros.Add("@HoraFin", dto.HoraFin, DbType.Time);

        try
        {
            var resultado = await _connection.QueryFirstOrDefaultAsync<ReservaResponseDto>(
                "negocio.sp_CrearReserva",
                parametros,
                transaction: _uow.Transaction,
                commandType: CommandType.StoredProcedure
            );

            return resultado ?? new ReservaResponseDto { Message = "No se pudo procesar la reserva." };
        }
        catch (SqlException ex) when (ex.Message.Contains("NOT_FOUND_404"))
        {
            throw new FunctionalException("SPACE_NOT_FOUND", "El espacio de coworking especificado no existe en el sistema.");
        }
        catch (SqlException ex) when (ex.Message.Contains("MAINTENANCE_405"))
        {
            throw new FunctionalException("SPACE_IN_MAINTENANCE", "El espacio de coworking seleccionado se encuentra en mantenimiento.");
        }
        catch (SqlException ex) when (ex.Message.Contains("CONFLICT_409"))
        {
            throw new DbUpdateConcurrencyException("El horario solicitado ya se encuentra ocupado por otra transacción simultánea.");
        }
    }

    public async Task<AgendaEspacioDto> ObtenerAgendaSemanalAsync(int espacioId, DateTime fechaInicio, DateTime fechaFin)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@EspacioId", espacioId, DbType.Int32);
        parametros.Add("@FechaInicio", fechaInicio, DbType.Date);
        parametros.Add("@FechaFin", fechaFin, DbType.Date);

        try
        {
            using var multi = await _connection.QueryMultipleAsync(
                "negocio.sp_ObtenerAgendaSemanal",
                parametros,
                transaction: _uow.Transaction,
                commandType: CommandType.StoredProcedure
            );

            var agenda = await multi.ReadFirstOrDefaultAsync<AgendaEspacioDto>();

            if (agenda == null)
            {
                throw new FunctionalException("NOT_FOUND_404", "El espacio de coworking especificado no existe en el sistema.");
            }

            var reservas = await multi.ReadAsync<ReservaOcupadaDto>();
            agenda.ReservasOcupadas = reservas.ToList();

            return agenda;
        }
        catch (SqlException ex) when (ex.Message.Contains("NOT_FOUND_404"))
        {
            throw new FunctionalException("SPACE_NOT_FOUND", "El espacio de coworking especificado no existe en el sistema o no está disponible.");
        }
    }

    public async Task<PrecioPreviewDto> ObtenerPreviewPrecioAsync(CrearReservaDto dto)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@EspacioId", dto.EspacioId, DbType.Int32);
        parametros.Add("@FechaReserva", dto.Fecha, DbType.Date);
        parametros.Add("@HoraInicio", dto.HoraInicio, DbType.Time);
        parametros.Add("@HoraFin", dto.HoraFin, DbType.Time);
        parametros.Add("@PrecioFinal", dbType: DbType.Decimal, direction: ParameterDirection.Output, precision: 18, scale: 2);

        CotizacionResultadoDto resultado = await _connection.QueryFirstOrDefaultAsync<CotizacionResultadoDto>(
            "negocio.sp_CalcularTarifaDinamica",
            new
            {
                EspacioId = dto.EspacioId,
                FechaReserva = dto.Fecha,
                HoraInicio = dto.HoraInicio,
                HoraFin = dto.HoraFin
            },
            transaction: _uow.Transaction,
            commandType: CommandType.StoredProcedure
        );

        return new PrecioPreviewDto { PrecioCalculado = resultado.PrecioCalculado, ReglaAplicada = resultado.ReglaAplicada };
    }

    public async Task<ReservaResponseDto> CancelarReservaPorUuidAsync(Guid codigoUuid)
    {
        var parametros = new DynamicParameters();
        parametros.Add("@CodigoUnicoUuid", codigoUuid, DbType.Guid);

        try
        {
            var resultado = await _connection.QueryFirstOrDefaultAsync<ReservaResponseDto>(
                "negocio.usp_CancelarReservaPorUuid",
                parametros,
                transaction: _uow.Transaction,
                commandType: CommandType.StoredProcedure
            );

            return resultado ?? new ReservaResponseDto { Message = "No se pudo procesar la cancelación." };
        }
        catch (SqlException ex) when (ex.Message.Contains("Completada"))
        {
            throw new FunctionalException("INVALID_STATUS", "Una reserva en estado Completada no se puede cancelar.");
        }
        catch (SqlException ex) when (ex.Message.Contains("no existe"))
        {
            throw new FunctionalException("NOT_FOUND_404", "La reserva solicitada no existe en el sistema.");
        }
    }
}
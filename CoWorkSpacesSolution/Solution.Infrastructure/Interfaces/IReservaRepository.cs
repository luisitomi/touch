using CoWorkSpacesSolution.Application.DTOs;
using Solution.Core.DTOs;

namespace Solution.Infrastructure.Interfaces;

public interface IReservaRepository
{
    Task<ReservaResponseDto> CrearReservaAsync(CrearReservaDto dto);
    Task<PrecioPreviewDto> ObtenerPreviewPrecioAsync(CrearReservaDto dto);
    Task<AgendaEspacioDto> ObtenerAgendaSemanalAsync(int espacioId, DateTime fechaInicio, DateTime fechaFin);
    Task<ReservaConsultaDto> VerificarReservaPorUuidAsync(Guid codigoUnicoUuid);
    Task<ReservaDetalleDto> ObtenerDetalleReservaPorUuidAsync(Guid codigoUnicoUuid);
    Task<ReservaResponseDto> CancelarReservaPorUuidAsync(Guid codigoUuid);
    Task<ConfirmacionReservaDto> ConfirmarPagoReservaAsync(ConfirmarPagoInputDto dto);
}
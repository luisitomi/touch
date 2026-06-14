using System;
using System.Collections.Generic;

namespace Solution.Core.DTOs;

/// <summary>
/// Modelo de transferencia de datos para representar la agenda y disponibilidad semanal de un espacio de CoWorking.
/// </summary>
public class AgendaEspacioDto
{
    /// <summary>
    /// Identificador único del espacio de CoWorking consultado.
    /// </summary>
    /// <example>1</example>
    public int EspacioId { get; set; }

    /// <summary>
    /// Nombre comercial o descriptivo del espacio de CoWorking.
    /// </summary>
    /// <example>Sala de Reuniones Ejecutiva</example>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Tarifa base por hora de uso establecida para el espacio de coworking.
    /// </summary>
    /// <example>50.00</example>
    public decimal TarifaBaseHora { get; set; }

    /// <summary>
    /// Hora de apertura operativa configurada para el espacio físico en formato HH:mm:ss.
    /// </summary>
    /// <example>07:00:00</example>
    public string HoraApertura { get; set; } = string.Empty;

    /// <summary>
    /// Hora límite de cierre operativa configurada para el espacio físico en formato HH:mm:ss.
    /// </summary>
    /// <example>23:00:00</example>
    public string HoraCierre { get; set; } = string.Empty;

    /// <summary>
    /// Listado de bloques horarios que ya han sido reservados y confirmados dentro de la semana consultada.
    /// </summary>
    public List<ReservaOcupadaDto> ReservasOcupadas { get; set; } = new();
}

/// <summary>
/// Modelo de transferencia de datos que detalla un bloque de tiempo ocupado por una reserva activa.
/// </summary>
public class ReservaOcupadaDto
{
    /// <summary>
    /// Identificador único de la reserva registrada.
    /// </summary>
    /// <example>104</example>
    public int ReservaId { get; set; }

    /// <summary>
    /// Título descriptivo del estado del bloque en el calendario.
    /// </summary>
    /// <example>Espacio Ocupado</example>
    public string Titulo { get; set; } = string.Empty;

    /// <summary>
    /// Fecha y hora exacta de inicio del bloque reservado en formato ISO 8601 (yyyy-MM-ddTHH:mm:ss).
    /// </summary>
    /// <example>2026-06-15T10:00:00</example>
    public string FechaInicio { get; set; } = string.Empty;

    /// <summary>
    /// Fecha y hora exacta de finalización del bloque reservado en formato ISO 8601 (yyyy-MM-ddTHH:mm:ss).
    /// </summary>
    /// <example>2026-06-15T13:30:00</example>
    public string FechaFin { get; set; } = string.Empty;
}
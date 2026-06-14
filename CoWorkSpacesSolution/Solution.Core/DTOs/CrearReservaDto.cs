namespace Solution.Core.DTOs;

/// <summary>
/// Modelo de transferencia de datos para la solicitud de creación o cotización de una reserva.
/// </summary>
public class CrearReservaDto
{
    /// <summary>
    /// Identificador único del espacio de CoWorking (Sala, Escritorio, Oficina).
    /// </summary>
    /// <example>1</example>
    public int EspacioId { get; set; }

    /// <summary>
    /// Fecha en la que se llevará a cabo la reserva (Formato: YYYY-MM-DD).
    /// </summary>
    /// <example>2026-06-15</example>
    public DateTime Fecha { get; set; }

    /// <summary>
    /// Hora exacta de inicio de la sesión en formato de 24 horas (HH:mm). Debe ser mayor o igual a las 08:00.
    /// </summary>
    /// <example>09:30</example>
    public string HoraInicio { get; set; } = string.Empty;

    /// <summary>
    /// Hora exacta de finalización de la sesión en formato de 24 horas (HH:mm). Debe ser menor o igual a las 22:00.
    /// </summary>
    /// <example>11:30</example>
    public string HoraFin { get; set; } = string.Empty;

    /// <summary>
    /// Método utilitario interno para convertir la cadena de texto de inicio en un tipo TimeSpan.
    /// </summary>
    public TimeSpan GetHoraInicioAsTimeSpan() => TimeSpan.Parse(HoraInicio);

    /// <summary>
    /// Método utilitario interno para convertir la cadena de texto de fin en un tipo TimeSpan.
    /// </summary>
    public TimeSpan GetHoraFinAsTimeSpan() => TimeSpan.Parse(HoraFin);
}
namespace Solution.Core.DTOs;

/// <summary>
/// Parámetros requeridos en el cuerpo de la petición para consultar la agenda semanal.
/// </summary>
public class ConsultaAgendaSemanalDto
{
    /// <summary>
    /// Identificador único del espacio de coworking.
    /// </summary>
    /// <example>1</example>
    public int EspacioId { get; set; }

    /// <summary>
    /// Fecha inicial de la semana a consultar en formato texto (yyyy-MM-dd).
    /// </summary>
    /// <example>2026-06-15</example>
    public string FechaInicio { get; set; } = string.Empty;

    /// <summary>
    /// Fecha final de la semana a consultar en formato texto (yyyy-MM-dd).
    /// </summary>
    /// <example>2026-06-21</example>
    public string FechaFin { get; set; } = string.Empty;
}
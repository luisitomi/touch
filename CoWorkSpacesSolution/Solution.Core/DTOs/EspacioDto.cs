using System;

namespace Solution.Core.DTOs;

/// <summary>
/// Modelo de transferencia de datos para la información detallada de un espacio de CoWorking disponible.
/// </summary>
public class EspacioDto
{
    /// <summary>
    /// Identificador único del espacio de CoWorking registrado en la base de datos.
    /// </summary>
    /// <example>1</example>
    public int EspacioId { get; set; }

    /// <summary>
    /// Nombre comercial o descriptivo asignado al espacio.
    /// </summary>
    /// <example>Innovation Lab</example>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Aforo máximo de personas permitido simultáneamente en el espacio de reunión.
    /// </summary>
    /// <example>8</example>
    public int CapacidadPersonas { get; set; }

    /// <summary>
    /// Tarifa base establecida por hora de uso del espacio de coworking (sin impuestos).
    /// </summary>
    /// <example>45.00</example>
    public decimal TarifaBaseHora { get; set; }
}
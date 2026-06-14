namespace Solution.Core.DTOs;

/// <summary>
/// Estructura unificada de respuesta para todas las peticiones de la API.
/// </summary>
/// <typeparam name="T">Tipo de dato que se retornará en la propiedad Data en caso de éxito.</typeparam>
public class ResponseDto<T>
{
    /// <summary>
    /// Código de estado personalizado de la operación (ej: SUCCESS, INVALID_DURATION, CONFLICT_409).
    /// </summary>
    /// <example>SUCCESS</example>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Mensaje informativo o descripción detallada del error para mostrar al usuario.
    /// </summary>
    /// <example>Reserva procesada con éxito.</example>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Datos resultantes de la operación. Será nulo si ocurre un error.
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Identificador único global (GUID) generado por petición para rastreo en logs de auditoría.
    /// </summary>
    /// <example>f47ac10b-58cc-4372-a567-0e02b2c3d479</example>
    public string TransactionId { get; set; } = string.Empty;
}
using CoWorkSpacesSolution.Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Solution.Common.Exception;
using Solution.Core.DTOs;
using Solution.Core.Validations;
using Solution.Infrastructure.Interfaces;
using System;
using System.Threading.Tasks;

namespace Solution.API.Controllers
{
    /// <summary>
    /// Controlador encargado de gestionar las operaciones de reservas para los espacios de CoWorking.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ReservasController : ControllerBase
    {
        private readonly IUnitOfWork _uow;
        private readonly IValidator<CrearReservaDto> _validator;

        public ReservasController(IUnitOfWork uow, IValidator<CrearReservaDto> validator)
        {
            _uow = uow;
            _validator = validator;
        }

        /// <summary>
        /// Crea una nueva reserva para un espacio de CoWorking aplicando control de concurrencia y reglas de negocio.
        /// </summary>
        /// <param name="dto">Objeto de transferencia con los datos requeridos para la reserva.</param>
        /// <returns>Retorna una estructura unificada con el estado de la operación y los datos de la reserva creada.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(ResponseDto<ReservaResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status405MethodNotAllowed)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> CrearReserva([FromBody] CrearReservaDto dto)
        {
            var validationResult = await _validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = "VALIDATION_ERROR",
                    Message = "Se presentaron errores en las reglas de negocio centralizadas.",
                    Data = validationResult.ToDictionary(),
                    TransactionId = Guid.NewGuid().ToString()
                });
            }

            var resultado = await _uow.Reservas.CrearReservaAsync(dto);

            var response = new ResponseDto<ReservaResponseDto>
            {
                Status = "SUCCESS",
                Message = "Reserva procesada con éxito.",
                Data = resultado,
                TransactionId = Guid.NewGuid().ToString()
            };

            return StatusCode(200, response);
        }

        /// <summary>
        /// Obtiene el detalle extendido de una reserva específica utilizando su identificador único (UUID).
        /// </summary>
        /// <remarks>
        /// Este endpoint es utilizado principalmente por la pantalla de consulta de reservas. 
        /// Permite validar el estado de la transacción y calcular si la reserva cumple con las políticas de cancelación (24 horas de anticipación).
        /// </remarks>
        /// <param name="codigo">El identificador único en formato GUID (UUID) generado de forma automática al registrar la reserva.</param>
        /// <returns>Retorna un objeto estandarizado con la información detallada del espacio reservado, costos y horarios.</returns>
        /// <response code="200">Éxito. Retorna los datos de la reserva solicitada mapeados de forma correcta.</response>
        /// <response code="400">Petición Incorrecta. El formato del código enviado en la URL no corresponde a un GUID válido.</response>
        /// <response code="404">No Encontrado. La reserva asociada al código provisto no existe en el sistema.</response>
        [HttpGet("detalle/{codigo}")]
        [ProducesResponseType(typeof(ResponseDto<ReservaDetalleDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObtenerDetalleReserva(string codigo)
        {
            if (!Guid.TryParse(codigo, out Guid guidResultado))
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = "ERROR",
                    Message = "El formato del código de reserva no es válido.",
                    TransactionId = Guid.NewGuid().ToString()
                });
            }

            try
            {
                var resultado = await _uow.Reservas.ObtenerDetalleReservaPorUuidAsync(guidResultado);

                var response = new ResponseDto<ReservaDetalleDto>
                {
                    Status = "SUCCESS",
                    Message = "Reserva encontrada con éxito.",
                    Data = resultado,
                    TransactionId = Guid.NewGuid().ToString()
                };

                return Ok(response);
            }
            catch (FunctionalException ex)
            {
                return NotFound(new ResponseDto<object>
                {
                    Status = "ERROR",
                    Message = ex.Message,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }
        }

        /// <summary>
        /// Obtiene una previsualización del precio estimado de la reserva aplicando la lógica de tarifa dinámica.
        /// </summary>
        /// <param name="dto">Objeto con los horarios y el espacio a evaluar para el cálculo en tiempo real.</param>
        /// <returns>Retorna el monto total calculado en base a la demanda y las horas solicitadas.</returns>
        [HttpPost("preview-tarifa")]
        [ProducesResponseType(typeof(ResponseDto<PrecioPreviewDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ObtenerPreviewPrecio([FromBody] CrearReservaDto dto)
        {
            var resultado = await _uow.Reservas.ObtenerPreviewPrecioAsync(dto);

            var response = new ResponseDto<PrecioPreviewDto>
            {
                Status = "SUCCESS",
                Message = "Tarifa calculada.",
                Data = resultado,
                TransactionId = Guid.NewGuid().ToString()
            };

            return Ok(response);
        }

        /// <summary>
        /// Busca y obtiene el detalle completo de una reserva por su código único UUID.
        /// </summary>
        /// <param name="codigo">Código único UUID de la reserva en formato string.</param>
        /// <returns>Retorna los datos detallados de la reserva y las políticas de cancelación aplicables.</returns>
        [HttpGet("buscar/{codigo}")]
        [ProducesResponseType(typeof(ResponseDto<ReservaConsultaDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> BuscarPorCodigo(string codigo)
        {
            if (!Guid.TryParse(codigo, out Guid guidResultado))
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = "ERROR",
                    Message = "El formato del código de reserva no es válido.",
                    TransactionId = Guid.NewGuid().ToString()
                });
            }

            try
            {
                var resultado = await _uow.Reservas.VerificarReservaPorUuidAsync(guidResultado);

                var response = new ResponseDto<ReservaConsultaDto>
                {
                    Status = "SUCCESS",
                    Message = "Reserva encontrada con éxito.",
                    Data = resultado,
                    TransactionId = Guid.NewGuid().ToString()
                };

                return Ok(response);
            }
            catch (FunctionalException ex) when (ex.FunctionalCode == "NOT_FOUND_404")
            {
                return NotFound(new ResponseDto<object>
                {
                    Status = "ERROR",
                    Message = ex.Message,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }
        }

        /// <summary>
        /// Obtiene la agenda semanal completa de un espacio físico detallando configuraciones y bloques de horas ocupados.
        /// </summary>
        /// <param name="dto">Objeto de transferencia con los parámetros de consulta para la agenda.</param>
        /// <returns>La información de configuración del espacio físico junto a su respectivo listado de reservas activas.</returns>
        /// <response code="200">Retorna de forma exitosa la agenda operativa y disponibilidad de la semana solicitada.</response>
        /// <response code="400">Si los parámetros ingresados en el cuerpo no cumplen con las validaciones de formato o negocio.</response>
        /// <response code="404">Si el identificador del espacio físico proporcionado no existe en el sistema.</response>
        [HttpPost("agenda")]
        [ProducesResponseType(typeof(ResponseDto<AgendaEspacioDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAgendaSemana([FromBody] ConsultaAgendaSemanalDto dto)
        {
            if (dto.EspacioId <= 0)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = "VALIDATION_ERROR",
                    Message = "El ID del espacio proporcionado debe ser mayor a cero.",
                    Data = null!,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }

            if (!DateTime.TryParse(dto.FechaInicio, out DateTime parsedInicio) || !DateTime.TryParse(dto.FechaFin, out DateTime parsedFin))
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = "VALIDATION_ERROR",
                    Message = "El formato de las fechas proporcionadas no es válido. Use yyyy-MM-dd.",
                    Data = null!,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }

            if (parsedInicio > parsedFin)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = "VALIDATION_ERROR",
                    Message = "La fecha de inicio no puede ser posterior a la fecha de fin.",
                    Data = null!,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }

            try
            {
                var agenda = await _uow.Reservas.ObtenerAgendaSemanalAsync(dto.EspacioId, parsedInicio, parsedFin);

                var response = new ResponseDto<AgendaEspacioDto>
                {
                    Status = "SUCCESS",
                    Message = "Agenda semanal sincronizada correctamente.",
                    Data = agenda,
                    TransactionId = Guid.NewGuid().ToString()
                };

                return StatusCode(200, response);
            }
            catch (FunctionalException ex)
            {
                return NotFound(new ResponseDto<object>
                {
                    Status = "NOT_FOUND_404",
                    Message = ex.Message,
                    Data = null!,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseDto<object>
                {
                    Status = "INTERNAL_SERVER_ERROR",
                    Message = "Ocurrió un error inesperado en el servidor al procesar la agenda semanal.",
                    Data = ex.Message,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }
        }

        /// <summary>
        /// Procesa la cancelación de una reserva basándose en las políticas de tiempo y estado del negocio.
        /// </summary>
        /// <param name="codigo">El identificador único (UUID) de la reserva a cancelar.</param>
        /// <returns>Retorna un objeto estandarizado con el mensaje de reembolso correspondiente.</returns>
        /// <response code="200">Éxito. La reserva fue cancelada y se detalla la política de reembolso aplicada.</response>
        /// <response code="400">Petición Incorrecta. El código provisto no es un GUID válido o la reserva no puede ser cancelada (ej. Estado Completada).</response>
        [HttpPost("cancelar/{codigo}")]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CancelarReserva(string codigo)
        {
            if (!Guid.TryParse(codigo, out Guid guidResultado))
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = "ERROR",
                    Message = "El formato del código de reserva no es válido.",
                    TransactionId = Guid.NewGuid().ToString()
                });
            }

            try
            {
                var resultado = await _uow.Reservas.CancelarReservaPorUuidAsync(guidResultado);

                var response = new ResponseDto<object>
                {
                    Status = "SUCCESS",
                    Message = resultado.Message,
                    TransactionId = Guid.NewGuid().ToString()
                };

                return Ok(response);
            }
            catch (FunctionalException ex)
            {
                return BadRequest(new ResponseDto<object>
                {
                    Status = "ERROR",
                    Message = ex.Message,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }
        }
    }
}
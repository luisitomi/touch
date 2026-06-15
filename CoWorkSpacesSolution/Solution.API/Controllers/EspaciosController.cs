using Microsoft.AspNetCore.Mvc;
using Solution.Core.DTOs;
using Solution.Infrastructure.Interfaces;
using WebApi.Dtos;

namespace Solution.API.Controllers
{
    /// <summary>
    /// Controlador encargado de gestionar las operaciones y consultas para los espacios de CoWorking.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class EspaciosController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public EspaciosController(IUnitOfWork uow)
        {
            _uow = uow;
        }

        /// <summary>
        /// Obtiene la lista de todos los espacios de CoWorking que se encuentran activos en el sistema.
        /// </summary>
        /// <returns>Retorna una estructura unificada con el listado de espacios disponibles.</returns>
        [HttpGet]
        [ProducesResponseType(typeof(ResponseDto<IEnumerable<EspacioDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ObtenerTodos()
        {
            try
            {
                var lista = await _uow.Espacios.ListarActivosAsync();

                var response = new ResponseDto<IEnumerable<EspacioDto>>
                {
                    Status = "SUCCESS",
                    Message = "Espacios obtenidos correctamente.",
                    Data = lista,
                    TransactionId = Guid.NewGuid().ToString()
                };

                return StatusCode(200, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseDto<object>
                {
                    Status = "INTERNAL_SERVER_ERROR",
                    Message = $"Sucedió un error inesperado en el servidor: {ex.Message}",
                    Data = null,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }
        }

        /// <summary>
        /// Registra un nuevo espacio de CoWorking en el sistema.
        /// </summary>
        /// <param name="request">Estructura de datos requerida para la creación del espacio.</param>
        /// <returns>Retorna el estado de la operación y el ID generado.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(ResponseDto<EspacioResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CrearEspacio([FromBody] EspacioRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return StatusCode(400, new ResponseDto<object>
                    {
                        Status = "BAD_REQUEST",
                        Message = "Los datos proporcionados no son válidos.",
                        Data = ModelState,
                        TransactionId = Guid.NewGuid().ToString()
                    });
                }

                var resultado = await _uow.Espacios.InsertarEspacioAsync(request);

                if (resultado.Status == "ERROR")
                {
                    return StatusCode(400, new ResponseDto<EspacioResponseDto>
                    {
                        Status = "ERROR",
                        Message = resultado.Message,
                        Data = resultado,
                        TransactionId = Guid.NewGuid().ToString()
                    });
                }

                return StatusCode(201, new ResponseDto<EspacioResponseDto>
                {
                    Status = "SUCCESS",
                    Message = resultado.Message,
                    Data = resultado,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseDto<object>
                {
                    Status = "INTERNAL_SERVER_ERROR",
                    Message = $"Sucedió un error inesperado en el servidor: {ex.Message}",
                    Data = null,
                    TransactionId = Guid.NewGuid().ToString()
                });
            }
        }
    }
}
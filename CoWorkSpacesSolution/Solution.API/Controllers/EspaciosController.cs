using Microsoft.AspNetCore.Mvc;
using Solution.Core.DTOs;
using Solution.Infrastructure.Interfaces;

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
    }
}
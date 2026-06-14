using Microsoft.AspNetCore.Mvc;
using Solution.Core.DTOs;
using Solution.Infrastructure.Interfaces;

namespace Solution.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ReportesController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public ReportesController(IUnitOfWork uow)
        {
            _uow = uow;
        }

        [HttpGet("dashboard")]
        [ProducesResponseType(typeof(ResponseDto<ReporteDashboardDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ResponseDto<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ObtenerReporteDashboard([FromQuery] DateTime fechaDesde, [FromQuery] DateTime fechaHasta)
        {
            try
            {
                if (fechaDesde > fechaHasta)
                {
                    return StatusCode(400, new ResponseDto<object>
                    {
                        Status = "BAD_REQUEST",
                        Message = "La fecha de inicio no puede ser mayor que la fecha final.",
                        Data = null,
                        TransactionId = Guid.NewGuid().ToString()
                    });
                }

                var reporte = await _uow.Reporte.ObtenerReporteDashboardAsync(fechaDesde, fechaHasta);

                var response = new ResponseDto<ReporteDashboardDto>
                {
                    Status = "SUCCESS",
                    Message = "Reporte de dashboard generado correctamente.",
                    Data = reporte,
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
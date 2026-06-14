using Moq;
using Solution.Common.Exception;
using Solution.Core.DTOs;
using Solution.Infrastructure.Interfaces;

namespace Solution.Tests
{
    public class ReservasPoliticasTests
    {
        private readonly Mock<IUnitOfWork> _uowMock;
        private readonly Mock<IReservaRepository> _reservaRepoMock;

        public ReservasPoliticasTests()
        {
            _uowMock = new Mock<IUnitOfWork>();
            _reservaRepoMock = new Mock<IReservaRepository>();
            _uowMock.Setup(u => u.Reservas).Returns(_reservaRepoMock.Object);
        }

        [Fact]
        public async Task CalcularTarifa_DebeRetornarTarifaRegular_CuandoNoAplicaNingunaRegla()
        {
            var dto = new CrearReservaDto
            {
                EspacioId = 1,
                Fecha = new DateTime(2026, 6, 15),
                HoraInicio = "12:00:00",
                HoraFin = "13:00:00"
            };

            _reservaRepoMock.Setup(r => r.ObtenerPreviewPrecioAsync(dto))
                .ReturnsAsync(new PrecioPreviewDto { PrecioCalculado = 80.00m, ReglaAplicada = "Tarifa Regular" });

            var resultado = await _uowMock.Object.Reservas.ObtenerPreviewPrecioAsync(dto);

            Assert.Equal(80.00m, resultado.PrecioCalculado);
            Assert.Equal("Tarifa Regular", resultado.ReglaAplicada);
        }

        [Fact]
        public async Task CalcularTarifa_DebeAplicarHoraPicoYAnticipacion_CuandoCruzaAmbosEscenarios()
        {
            var dto = new CrearReservaDto
            {
                EspacioId = 1,
                Fecha = new DateTime(2026, 6, 22),
                HoraInicio = "09:00:00",
                HoraFin = "10:00:00"
            };

            _reservaRepoMock.Setup(r => r.ObtenerPreviewPrecioAsync(dto))
                .ReturnsAsync(new PrecioPreviewDto { PrecioCalculado = 96.00m, ReglaAplicada = "Anticipación ≥ 7d (-5%) + Hora Pico (+25%)" });

            var resultado = await _uowMock.Object.Reservas.ObtenerPreviewPrecioAsync(dto);

            Assert.Equal(96.00m, resultado.PrecioCalculado);
            Assert.Contains("Hora Pico", resultado.ReglaAplicada);
        }

        [Fact]
        public async Task CalcularTarifa_DebeAcumularFinDeSemanaYLargaDuracion()
        {
            var dto = new CrearReservaDto
            {
                EspacioId = 1,
                Fecha = new DateTime(2026, 6, 20),
                HoraInicio = "12:00:00",
                HoraFin = "17:00:00"
            };

            _reservaRepoMock.Setup(r => r.ObtenerPreviewPrecioAsync(dto))
                .ReturnsAsync(new PrecioPreviewDto { PrecioCalculado = 420.00m, ReglaAplicada = "Fin de Semana (+15%) + Larga Duración (-10%)" });

            var resultado = await _uowMock.Object.Reservas.ObtenerPreviewPrecioAsync(dto);

            Assert.Equal(420.00m, resultado.PrecioCalculado);
        }

        [Fact]
        public async Task CalcularTarifa_DebeLanzarExcepcion_CuandoEspacioEstaEnMantenimiento()
        {
            var dto = new CrearReservaDto
            {
                EspacioId = 2,
                Fecha = new DateTime(2026, 6, 15),
                HoraInicio = "10:00:00",
                HoraFin = "11:00:00"
            };

            _reservaRepoMock.Setup(r => r.ObtenerPreviewPrecioAsync(dto))
                .ThrowsAsync(new FunctionalException("SPACE_IN_MAINTENANCE", "El espacio de coworking seleccionado se encuentra en mantenimiento."));

            var excepcion = await Assert.ThrowsAsync<FunctionalException>(() => _uowMock.Object.Reservas.ObtenerPreviewPrecioAsync(dto));
            Assert.Contains("mantenimiento", excepcion.Message);
        }

        [Fact]
        public async Task CancelarReserva_DebeRetornarReembolso100_CuandoFaltanMasDe48Horas()
        {
            var uuid = Guid.NewGuid();

            _reservaRepoMock.Setup(r => r.CancelarReservaPorUuidAsync(uuid))
                .ReturnsAsync(new ReservaResponseDto { Message = "Cancelación con más de 48h de antelación: reembolso del 100%." });

            var resultado = await _uowMock.Object.Reservas.CancelarReservaPorUuidAsync(uuid);

            Assert.Equal("Cancelación con más de 48h de antelación: reembolso del 100%.", resultado.Message);
        }

        [Fact]
        public async Task CancelarReserva_DebeRetornarReembolso50_CuandoFaltanEntre24y48Horas()
        {
            var uuid = Guid.NewGuid();

            _reservaRepoMock.Setup(r => r.CancelarReservaPorUuidAsync(uuid))
                .ReturnsAsync(new ReservaResponseDto { Message = "Cancelación entre 24h y 48h: reembolso del 50%." });

            var resultado = await _uowMock.Object.Reservas.CancelarReservaPorUuidAsync(uuid);

            Assert.Equal("Cancelación entre 24h y 48h: reembolso del 50%.", resultado.Message);
        }

        [Fact]
        public async Task CancelarReserva_DebePermitirCancelarSinReembolso_CuandoFaltanMenosDe24Horas()
        {
            var uuid = Guid.NewGuid();

            _reservaRepoMock.Setup(r => r.CancelarReservaPorUuidAsync(uuid))
                .ReturnsAsync(new ReservaResponseDto { Message = "Cancelación con menos de 24h: sin reembolso." });

            var resultado = await _uowMock.Object.Reservas.CancelarReservaPorUuidAsync(uuid);

            Assert.Equal("Cancelación con menos de 24h: sin reembolso.", resultado.Message);
        }

        [Fact]
        public async Task CancelarReserva_DebeLanzarExcepcion_CuandoReservaYaEstaCompletada()
        {
            var uuid = Guid.NewGuid();

            _reservaRepoMock.Setup(r => r.CancelarReservaPorUuidAsync(uuid))
                .ThrowsAsync(new FunctionalException("INVALID_STATUS", "Una reserva en estado Completada no se puede cancelar."));

            var excepcion = await Assert.ThrowsAsync<FunctionalException>(() => _uowMock.Object.Reservas.CancelarReservaPorUuidAsync(uuid));
            Assert.Contains("Completada no se puede cancelar", excepcion.Message);
        }
    }
}
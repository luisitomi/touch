namespace Solution.Core.DTOs
{
    public class ReservaResponseDto
    {
        public int ReservaId { get; set; }
        public int EspacioId { get; set; }
        public decimal PrecioFinal { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string Message { get; set; } = "Reserva procesada con éxito.";
    }
}

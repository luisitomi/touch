namespace Solution.Core.DTOs
{
    public class ConfirmacionReservaDto
    {
        public int ReservaId { get; set; }
        public string EstadoStatus { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
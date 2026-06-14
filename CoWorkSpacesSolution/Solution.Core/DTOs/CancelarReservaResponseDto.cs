namespace Solution.Core.DTOs
{
    public class CancelarReservaResponseDto
    {
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int ReservaId { get; set; }
    }
}

namespace CoWorkSpacesSolution.Application.DTOs
{
    public class ReservaDetalleDto
    {
        public int ReservaId { get; set; }
        public Guid Codigo { get; set; }
        public string NombreEspacio { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string HoraInicio { get; set; } = string.Empty;
        public string HoraFin { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string FechaCompletaInicio { get; set; } = string.Empty;
    }
}
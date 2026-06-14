namespace Solution.Core.DTOs
{
    public class ReporteEspacioDto
    {
        public int EspacioId { get; set; }
        public string NombreEspacio { get; set; } = string.Empty;
        public decimal IngresosPorEspacio { get; set; }
        public decimal TasaOcupacionPorcentaje { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace WebApi.Dtos
{
    public class EspacioRequestDto
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int Capacidad { get; set; }

        [Required]
        [Range(0.0, double.MaxValue)]
        public decimal TarifaBaseHora { get; set; }

        [Required]
        public TimeSpan HorarioApertura { get; set; }

        [Required]
        public TimeSpan HorarioCierre { get; set; }
    }
}
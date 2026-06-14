using FluentValidation;
using Solution.Core.DTOs;
using System;

namespace Solution.Core.Validations
{
    public class CrearReservaValidator : AbstractValidator<CrearReservaDto>
    {
        public CrearReservaValidator()
        {
            RuleFor(x => x.EspacioId)
                .GreaterThan(0)
                .WithMessage("El identificador del espacio debe ser un número válido mayor a cero.");

            RuleFor(x => x)
                .Must(x => {
                    var duracion = x.GetHoraFinAsTimeSpan() - x.GetHoraInicioAsTimeSpan();
                    return duracion.TotalMinutes >= 30 && duracion.TotalHours <= 8;
                })
                .WithName("Duracion")
                .WithMessage("La duración de la reserva debe ser de mínimo 30 minutos y máximo 8 horas.");
        }
    }
}
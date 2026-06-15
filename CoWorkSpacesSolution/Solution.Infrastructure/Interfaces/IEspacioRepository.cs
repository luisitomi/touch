using Solution.Core.DTOs;
using WebApi.Dtos;

namespace Solution.Infrastructure.Interfaces
{
    public interface IEspacioRepository
    {
        Task<IEnumerable<EspacioDto>> ListarActivosAsync();
        Task<EspacioResponseDto> InsertarEspacioAsync(EspacioRequestDto dto);
    }
}

using Solution.Core.DTOs;

namespace Solution.Infrastructure.Interfaces
{
    public interface IEspacioRepository
    {
        Task<IEnumerable<EspacioDto>> ListarActivosAsync();
    }
}

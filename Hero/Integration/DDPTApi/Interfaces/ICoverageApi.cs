using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;
using WebApiDto.Dto.DDPT;

namespace Hero.Integration.DDPTApi.Interfaces
{
    public interface ICoverageApi
    {
        Task<List<CoverageType>> GetCoverageTypes(CoverageRequest request);
    }
}

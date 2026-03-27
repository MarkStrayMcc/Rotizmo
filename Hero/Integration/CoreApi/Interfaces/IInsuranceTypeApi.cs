using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IInsuranceTypeApi
    {
        Task<List<InsuranceType>> GetAsync();
    }
}

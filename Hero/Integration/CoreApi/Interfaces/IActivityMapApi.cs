using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IActivityMapApi
    {
        Task<List<ActivityMap>> GetAsync(int productId, int? parentId);
        Task<List<ActivityMap>> GetAsync(string productCode, string childActivityCode);

    }
}

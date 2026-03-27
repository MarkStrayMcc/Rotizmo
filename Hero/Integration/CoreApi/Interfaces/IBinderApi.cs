using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IBinderApi
    {
        Task<List<BinderLookup>> GetBinderLookups();
        Task<List<BinderSectionLookup>> GetBinderSectionLookups();
    }
}

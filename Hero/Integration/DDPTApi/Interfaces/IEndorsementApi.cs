using Hero.Models;
using System.Threading.Tasks;
using WebApiDtos = WebApiDto.Dto.DDPT;

namespace Hero.Integration.DDPTApi.Interfaces
{
    public interface IEndorsementApi
    {
        Task<AvailableEndorsementsResponse> GetAvailable(AvailableEndorsementsRequest request);
        Task<AutoAttachingEndorsementsResponse> GetAutoAttaching(AutoAttachingEndorsementsRequest request);
        Task<WebApiDtos.DocumentResult> GetDocument(EndorsementRequest request);
    }
}

using Hero.Integration.DDPTApi.Interfaces;
using Hero.Models;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using WebApiDtos = WebApiDto.Dto.DDPT;

namespace Hero.Integration.DDPTApi
{
    public class EndorsementApi : BaseDDPTApi, IEndorsementApi
    {
        private readonly string _endorsementsUrl;

        public EndorsementApi(IConfigurationRoot configuration) : base(configuration)
        {
            _endorsementsUrl = Configuration["DDPTApi:Endorsements"];
        }

        public Task<AvailableEndorsementsResponse> GetAvailable(AvailableEndorsementsRequest request)
        {
            var availableEndorsementsUrl = $"{_endorsementsUrl}/available";
            return PostAsyncTyped<AvailableEndorsementsRequest, AvailableEndorsementsResponse>(availableEndorsementsUrl, request);
        }

        public Task<AutoAttachingEndorsementsResponse> GetAutoAttaching(AutoAttachingEndorsementsRequest request)
        {
            var availableEndorsementsUrl = $"{_endorsementsUrl}/auto-attaching";
            return PostAsyncTyped<AutoAttachingEndorsementsRequest, AutoAttachingEndorsementsResponse>(availableEndorsementsUrl, request);
        }

        public Task<WebApiDtos.DocumentResult> GetDocument(EndorsementRequest request)
        {
            var getDocumentUrl = $"{_endorsementsUrl}/getdocument";
            return PostAsyncTyped<EndorsementRequest, WebApiDtos.DocumentResult>(getDocumentUrl, request);
        }
    }
}

using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi
{
    public class BordereauAPI : BaseApi, IBordereauAPI
    {

        protected string BordereauDateClosedUrl { get; }

        protected string IsReceivedDateValidUrl { get; }

        public BordereauAPI(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor): base(configuration, httpContextAccessor)
        {
            this.BordereauDateClosedUrl = configuration["CoreApi:Bordereau:DateClosed"];
            this.IsReceivedDateValidUrl = configuration["CoreApi:Bordereau:IsReceivedDateValid"];
        }

        public async Task<BordereauClosedDateResponse> GetBordereauCloseDate()
        {
            return await GetAsyncTyped<BordereauClosedDateResponse>($"{this.BordereauDateClosedUrl}");
        }

        public async Task<bool> IsReceivedDateValid(string receivedDate)
        {
            return await GetAsyncTyped<bool>($"{this.IsReceivedDateValidUrl}?receivedDate={receivedDate}");
        }
    }
}
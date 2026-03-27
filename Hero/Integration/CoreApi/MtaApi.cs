using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.CoreApi
{
    public class MtaApi : BaseApi, IMtaApi
    {
        private readonly string _mtaAddressChangeUrl;

        public MtaApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _mtaAddressChangeUrl = configuration["CoreApi:MtaAddressChange"];
        }

        public async Task<AddressChangeResult> AddressChange(AddressChangeMtaRequest newAddress, string policyId)
        {
            return await PostAsyncTyped<AddressChangeMtaRequest, AddressChangeResult>(_mtaAddressChangeUrl.Replace("{policyNumber}", policyId), newAddress);
        }
    }
} 

using Hero.Integration.CoreApi.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto.ClaimsFinance;

namespace Hero.Integration.CoreApi
{
    public class EcfReconciliationGroupApi : BaseApi, IEcfReconciliationGroupApi
    {
        private readonly string _ecfReconciliationGroupUrl;

        /// <inheritdoc />
        public EcfReconciliationGroupApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _ecfReconciliationGroupUrl = _configuration["CoreApi:EcfReconciliationGroups"];
        }

        public async Task<EcfReconciliationGroup> SaveEcfReconciliationGroupAsync(EcfReconciliationGroupRequest reconciliationGroupRequest)
        {
            return await PostAsyncTyped<EcfReconciliationGroupRequest, EcfReconciliationGroup>(_ecfReconciliationGroupUrl, reconciliationGroupRequest);
        }

        public async Task<IList<EcfReconciliationGroup>> DeleteEcfReconciliationGroupsAsync(List<int> ecfReconciliationGroupItemIds)
        {
            var requestUrl = $"{_ecfReconciliationGroupUrl}/delete";
            return await PostAsyncTyped<List<int>, IList<EcfReconciliationGroup>>(requestUrl, ecfReconciliationGroupItemIds);
        }
    }
}

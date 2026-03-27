using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi
{
    public class SurplusLineApi : BaseApi, ISurplusLineApi
    {
        private readonly string _baseUrl;
        private readonly string _surplusLinesResolveForRenewalUrl;

        public SurplusLineApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _baseUrl = configuration["SurplusLinesService:BaseUrl"];
            _surplusLinesResolveForRenewalUrl = configuration["CoreApi:SurplusLinesForRenewal"];
        }

        public Task<List<SurplusLinesServiceResponse>> GetSurplusLines(string stateCode, int brokerTeamId)
        {
            var url = $"{_baseUrl}verified-surplus-lines-brokers?licenseStateIsoCode={stateCode}";
            return GetAsyncTyped<List<SurplusLinesServiceResponse>>(url);
        }

        public async Task<SurplusLine> ResolveForExpiringPolicy(string policyNumber)
        {
            if (string.IsNullOrWhiteSpace(policyNumber))
                return null;

            var url = $"{_surplusLinesResolveForRenewalUrl}?expiringPolicyNumber={Uri.EscapeDataString(policyNumber)}";
            var (found, value) = await TryGetAsync<SurplusLine>(url);

            return found ? value : null;
        }
    }
}
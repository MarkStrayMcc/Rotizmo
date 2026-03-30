
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Tests.Integration.CoreApi.TestDoubles
{
    internal class TestableSurplusLineApi : ISurplusLineApi
    {
        public string LastRequestedUrl { get; private set; }
        public object GetAsyncTypedStub { get; set; }
        public (bool found, object value)? TryGetAsyncStub { get; set; }

        public TestableSurplusLineApi(IConfigurationRoot _ /*config*/, IHttpContextAccessor __ /*ctx*/) { }

        public Task<List<SurplusLinesServiceResponse>> GetSurplusLines(string stateCode, int brokerTeamId)
        {
            LastRequestedUrl =
                $"https://surplus-lines.local/verified-surplus-lines-brokers?licenseStateIsoCode={stateCode}";

            return Task.FromResult(GetAsyncTypedStub as List<SurplusLinesServiceResponse>);
        }

        public Task<SurplusLine> ResolveForExpiringPolicy(string policyNumber)
        {
            if (string.IsNullOrWhiteSpace(policyNumber))
                return Task.FromResult<SurplusLine>(null);

            var escaped = Uri.EscapeDataString(policyNumber);
            LastRequestedUrl =
                $"https://coreapi.local/surplus-lines/resolve?expiringPolicyNumber={escaped}";

            if (TryGetAsyncStub is { } stub)
            {
                var (found, obj) = stub;
                return Task.FromResult(found ? obj as SurplusLine : null);
            }

            return Task.FromResult<SurplusLine>(null);
        }
    }
}

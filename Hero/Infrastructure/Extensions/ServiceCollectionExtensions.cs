using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.FeatureManagement;
using Polly;
using Polly.Contrib.WaitAndRetry;
using Polly.Extensions.Http;
using System;
using System.Net.Http;

namespace Hero.Infrastructure
{
    public static class ServiceCollectionExtensions
    {
        private const string _frontDoorAccessHeaderKey = "cfcapps-frontdoor-access-secret";
        private const string _frontDoorAccessHeaderValueKey = "Authentication:CfcFrontDoorAccessSecret";
        private const string _lzDefaultFrontDoorHeaderSecretKey = "Authentication:LzDefaultFrontDoorHeaderSecret";

        public static IHttpClientBuilder AddCfcApiHttpClient<TClient, TImplementation>(this IServiceCollection services,
            IConfiguration configuration, string baseUrlKey) where TClient : class where TImplementation : class, TClient
        {
            return services
                .AddHttpClient<TClient, TImplementation>(httpClient => ConfigureHttpClient(httpClient, configuration, baseUrlKey))
                .AddHttpMessageHandler(GetHttpMessageHandler)
                .AddPolicyHandler(GetRetryPolicy());
        }

        public static IHttpClientBuilder AddSanctionsScreeningApiHttpClient<TClient, TImplementation>(this IServiceCollection services,
            IConfiguration configuration, string baseUrlKey) where TClient : class where TImplementation : class, TClient
        {
            return services
                .AddHttpClient<TClient, TImplementation>(httpClient => ConfigureHttpClientWithLzSecret(httpClient, configuration, baseUrlKey))
                .AddHttpMessageHandler(GetHttpMessageHandler)
                .AddHttpMessageHandler(GetSanctionsScreeningHeadersHandler)
                .AddPolicyHandler(GetRetryPolicy());
        }

        private static void ConfigureHttpClient(HttpClient httpClient, IConfiguration configuration, string baseUrlKey)
        {
            var baseUrl = configuration[baseUrlKey];
            var frontDoorAccessHeaderValue = configuration[_frontDoorAccessHeaderValueKey];

            httpClient.BaseAddress = new Uri(baseUrl);
            httpClient.DefaultRequestHeaders.Add(_frontDoorAccessHeaderKey, frontDoorAccessHeaderValue);
        }

        private static void ConfigureHttpClientWithLzSecret(HttpClient httpClient, IConfiguration configuration, string baseUrlKey)
        {
            var baseUrl = configuration[baseUrlKey];
            var frontDoorAccessHeaderValue = configuration[_lzDefaultFrontDoorHeaderSecretKey];

            httpClient.BaseAddress = new Uri(baseUrl);
            httpClient.DefaultRequestHeaders.Add(_frontDoorAccessHeaderKey, frontDoorAccessHeaderValue);
        }

        private static DelegatingHandler GetHttpMessageHandler(IServiceProvider serviceProvider)
        {
            var httpContextAccessor = serviceProvider.GetRequiredService<IHttpContextAccessor>();
            var httpMessageHandler = new CfcHeadersDelegatingHandler(httpContextAccessor);

            return httpMessageHandler;
        }

        private static DelegatingHandler GetSanctionsScreeningHeadersHandler(IServiceProvider serviceProvider)
        {
            var featureManager = serviceProvider.GetRequiredService<IFeatureManager>();
            return new SanctionsScreeningHeadersDelegatingHandler(featureManager);
        }

        private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
        {
            var delay = Backoff.DecorrelatedJitterBackoffV2(TimeSpan.FromSeconds(1), 3);
            var retryPolicy = HttpPolicyExtensions
                .HandleTransientHttpError()
                .WaitAndRetryAsync(delay);

            return retryPolicy;
        }
    }
}

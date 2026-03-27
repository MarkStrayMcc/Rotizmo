using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Threading.Tasks;
using Hero.Infrastructure;
using System.Net.Http;

namespace Hero.Integration
{
    public class BaseDDPTApi
    {
        protected readonly IConfigurationRoot Configuration;
        private const string FrontDoorAccessKeyHeader = "cfcapps-frontdoor-access-secret";
        private static string _frontDoorAccessSecretHeaderValue;

        protected BaseDDPTApi(IConfigurationRoot configuration)
        {
            Configuration = configuration;
            _frontDoorAccessSecretHeaderValue = Configuration["Authentication:CfcFrontDoorAccessSecret"];
        }

        protected static async Task<T> GetAsyncTyped<T>(string url)
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add(FrontDoorAccessKeyHeader, _frontDoorAccessSecretHeaderValue);
                var response = await client.GetAsync(url);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    throw new System.Exception(responseBody);

                return JsonConvert.DeserializeObject<T>(responseBody);
            }
        }

        protected static async Task<T2> PostAsyncTyped<T, T2>(string url, T model)
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add(FrontDoorAccessKeyHeader, _frontDoorAccessSecretHeaderValue);
                var response = await client.PostAsync(url, model?.AsJson());
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    throw new System.Exception(responseBody);

                return JsonConvert.DeserializeObject<T2>(responseBody);
            }
        }
    }
}

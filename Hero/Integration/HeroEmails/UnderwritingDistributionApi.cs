using Hero.Integration.HeroEmails.Interfaces;
using Hero.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace Hero.Integration.HeroEmails
{
    public class UnderwritingDistributionApi: IUnderwritingDistributionApi
    {
        private readonly HttpClient _httpClient;
        private const string _sendEmailWithSyncEndpoint = "api/v1/send/heroEmail";

        public UnderwritingDistributionApi(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> SendEmail(Email email)
        {
            var url = $"{_httpClient.BaseAddress}{_sendEmailWithSyncEndpoint}";

            var response = await _httpClient.PostAsJsonAsync(url, email);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            return false;
        }
    }
}

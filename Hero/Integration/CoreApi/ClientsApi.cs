using System;
using System.Net;
using System.Threading.Tasks;
using Hero.Infrastructure.Exceptions;
using Hero.Integration.CoreApi.Interfaces;
using System.Net.Http;
using Newtonsoft.Json;

namespace Hero.Integration.CoreApi
{
    public class ClientsApi : IClientsApi
    {
        private readonly HttpClient _client;

        public ClientsApi(HttpClient client)
        {
            _client = client;
        }

        public async Task<bool> HasSanctions(string clientName, string countryIsoCode, string stage, bool isSendEmail)
        {
            var url = $"{_client.BaseAddress}/clients/{Uri.EscapeDataString(clientName)}/has-sanctions?countryIsoCode={countryIsoCode}&stage={stage}&isSendEmail={isSendEmail}";
            var response = await _client.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();

            if (response.StatusCode == HttpStatusCode.BadRequest)
            {
                throw new ValidationException(response.ReasonPhrase);
            }
            else if (response.StatusCode == HttpStatusCode.NotFound)
            {
                throw new NotFoundException();
            }
            else if (!response.IsSuccessStatusCode)
            {
                throw new Exception(content);
            }

            return JsonConvert.DeserializeObject<bool>(content);
        }
    }
}

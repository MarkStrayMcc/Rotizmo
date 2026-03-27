using Hero.Infrastructure.Exceptions;
using Hero.Models.Payments;
using Newtonsoft.Json;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Hero.Integration.DirectBilling
{
    public class DirectBillingApi : IDirectBillingApi
    {
        private readonly HttpClient _client;

        private const string _noContextMessage = "Payment limits have not been configured yet.";

        public DirectBillingApi(HttpClient client)
        {
            _client = client;
        }

        public async Task<Limit> GetPaymentLimit(string countryCode)
        {
            var url = $"{_client.BaseAddress}/payments/limits?CountryCode={countryCode}";
            var response = await _client.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();

            if (response.StatusCode == HttpStatusCode.BadRequest)
            {
                throw new ValidationException(response.ReasonPhrase);
            }
            else if (response.StatusCode == HttpStatusCode.NotFound ||
                     (response.StatusCode == HttpStatusCode.InternalServerError && content == _noContextMessage))
            {
                throw new NotFoundException();
            }
            else if (!response.IsSuccessStatusCode)
            {
                throw new Exception(content);
            }

            return JsonConvert.DeserializeObject<Limit>(content);
        }

        public async Task<ContactDetails> GetContactDetails(string externalCustomerReference)
        {
            var url = $"{_client.BaseAddress}/billing/{externalCustomerReference}/contact-details";
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

            return JsonConvert.DeserializeObject<ContactDetails>(content);
        }
    }
}
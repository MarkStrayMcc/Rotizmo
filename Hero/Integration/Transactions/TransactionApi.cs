using Hero.Infrastructure.Exceptions;
using Hero.Integration.Transaction;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Hero.Integration.DirectBilling
{
    public class TransactionApi : BaseApi, ITransactionApi
    {
        private readonly string _coreApiUrl;
        private readonly HttpClient _client;

        public TransactionApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor, HttpClient client) : base(configuration, httpContextAccessor)
        {
            _coreApiUrl = _configuration["CoreApi:BaseUrl"];
            _client = client;
        }


        public async Task<ICollection<Hero.Models.Transaction>> GetByPolicyNumber(string policyNumber)
        {
            var url = $"{_coreApiUrl}api/transactions/policyNumber/{policyNumber}";
            var response = await _client.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();

            if (response.StatusCode == HttpStatusCode.BadRequest)
            {
                throw new ValidationException(response.ReasonPhrase);
            }
            else if (response.StatusCode == HttpStatusCode.NotFound ||
                     (response.StatusCode == HttpStatusCode.InternalServerError))
            {
                throw new NotFoundException();
            }
            else if (!response.IsSuccessStatusCode)
            {
                throw new Exception(content);
            }

            return JsonConvert.DeserializeObject<ICollection<Hero.Models.Transaction>>(content);
        }
    }
}
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class ProductApi : BaseApi, IProductApi
    {
        private readonly string _productsUrl;
        public ProductApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _productsUrl = _configuration["CoreApi:Products"];
        }

        public async Task<List<Product>> GetAsync()
        {
            return await GetAsyncTyped<List<Product>>(_productsUrl);
        }

        public async Task<List<Product>> SearchAsync(string searchTerm)
        {
            return await GetAsyncTyped<List<Product>>(_productsUrl);
        }

        public async Task<Product> GetAsync(int productId)
        {
            return await GetAsyncTyped<Product>($"{_productsUrl}/{productId}");
        }

        public async Task<bool> IsActivitySearchEnabled(string productCode)
        {
            var url = $"{_productsUrl}/{HttpUtility.UrlEncode(productCode.Replace("&", "And"))}/is-activity-search-enabled";
            return await GetAsyncTyped<bool>(url);
        }
    }
}

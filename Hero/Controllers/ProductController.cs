using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;

namespace Hero.Controllers
{
    public class ProductController : Controller
    {
        private readonly IProductApi _productApi;

        public ProductController(IProductApi productApi)
        {
            _productApi = productApi;
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> GetById(int productId)
        {
            var product = await _productApi.GetAsync(productId);
            return Ok(product);
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> IsActivitySearchEnabled(string productCode)
        {
            var result = await _productApi.IsActivitySearchEnabled(productCode);
            return Ok(result);
        }
    }
}

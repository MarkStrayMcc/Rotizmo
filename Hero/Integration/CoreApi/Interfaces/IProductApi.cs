using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IProductApi
    {
        Task<List<Product>> GetAsync();
        Task<List<Product>> SearchAsync(string searchTerm);
        Task<Product> GetAsync(int productId);
        Task<bool> IsActivitySearchEnabled(string productCode);
    }
}

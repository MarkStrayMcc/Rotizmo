using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface ICurrencyApi
    {
        Task<List<Currency>> GetAsync();
        Task<Currency> GetByCountryIdAsync(int countryId);
        Task<string> GetByIsoCodeIdAsync(string isocode);
        Task<decimal> GetRateAsync(string isocode);
    }
}

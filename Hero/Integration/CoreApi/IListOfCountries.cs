using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi;

public interface IListOfCountries
{
    Task<Country> GetCountryByName(string countryName);
    Task<Country> GetCountryByCountryId(int countryId);
}
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;
using WebApiDto.Dto.MapApis;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface ILocationApi
    {
        Task<List<ClientLocation>> GetAsync(int clientId);

        Task<MessageResult> AddAsync(ClientLocation clientLocation);

        Task<MessageResult> UpdateAsync(ClientLocation clientLocation);

        Task<MessageResult> DeleteAsync(ClientLocation clientLocation);

        Task<AutocompleteResult> GetAutocompleteAddressAsync(AutocompleteRequest model);

        Task<PlaceResult> GetPlaceDetailsAddressAsync(string placeId);

        Task<List<StateProvince>> GetCountryStates(string countryCode);

        Task<List<StateProvince>> GetCountryStatesByCountryId(int countryId);

        Task<Country> GetCountryById(int countryId);
    }
}

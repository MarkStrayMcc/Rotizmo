using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;
using WebApiDto.Dto.MapApis;

namespace Hero.Integration.CoreApi
{
    public class LocationApi : BaseApi, ILocationApi
    {
        private static readonly string[] CountriesThatHaveStateProvinces = { "US", "CA", "AU" };

        private string _locationUrl;
        private string _postLocationUrl;
        private string _updateLocationUrl;
        private string _deleteLocationUrl;
        private string _autotcompleteAddressUrl;
        private string _placeDetailsAddressUrl;
        private string _countryStatesUrl;
        private readonly IListOfCountries _countries;

        public LocationApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor, IListOfCountries countries) : base(configuration, httpContextAccessor)
        {
            _locationUrl = _configuration["CoreApi:Locations"];
            _postLocationUrl = _configuration["CoreApi:AddLocation"];
            _updateLocationUrl = _configuration["CoreApi:EditLocation"];
            _deleteLocationUrl = _configuration["CoreApi:DeleteLocation"];
            _autotcompleteAddressUrl = _configuration["CoreApi:AutocomplteteAddress"];
            _placeDetailsAddressUrl = _configuration["CoreApi:PlaceDetailsAddress"];
            _countryStatesUrl = configuration["CoreApi:CountryStates"];
            _countries = countries;
        }

        public async Task<List<ClientLocation>> GetAsync(int clientId)
        {
            _locationUrl = string.Format("{0}/{1}", _locationUrl, clientId);
            return await GetAsyncTyped<List<ClientLocation>>(_locationUrl);
        }

        public async Task<MessageResult> AddAsync(ClientLocation clientLocation)
        {
            return await PostAsyncTyped<ClientLocation, MessageResult>(_postLocationUrl, clientLocation);
        }

        public async Task<MessageResult> UpdateAsync(ClientLocation clientLocation)
        {
            return await UpdateAsyncTyped<ClientLocation, MessageResult>(_updateLocationUrl, clientLocation);
        }
        public async Task<MessageResult> DeleteAsync(ClientLocation clientLocation)
        {
            return await PostAsyncTyped<ClientLocation, MessageResult>(_deleteLocationUrl, clientLocation);
        }

        public async Task<AutocompleteResult> GetAutocompleteAddressAsync(AutocompleteRequest model)
        {
            return await PostAsyncTyped<AutocompleteRequest, AutocompleteResult>(_autotcompleteAddressUrl, model);
        }

        public async Task<PlaceResult> GetPlaceDetailsAddressAsync(string placeId)
        {
            _placeDetailsAddressUrl = $"{_placeDetailsAddressUrl}/{placeId}";
            return await GetAsyncTyped<PlaceResult>(_placeDetailsAddressUrl);
        }

        public async Task<List<StateProvince>> GetCountryStates(string countryCode)
        {
            if (!CountriesThatHaveStateProvinces.Contains(countryCode))
                return new List<StateProvince>();
            
            var countryStatesUrl = $"{_countryStatesUrl}/{countryCode}";
            return await GetAsyncTyped<List<StateProvince>>(countryStatesUrl);
        }

        public async Task<List<StateProvince>> GetCountryStatesByCountryId(int countryId)
        {
            var country = await _countries.GetCountryByCountryId(countryId);
            if (!CountriesThatHaveStateProvinces.Contains(country.IsoCode))
                return new List<StateProvince>();

            var countryStatesUrl = $"{_countryStatesUrl}/{country.IsoCode}";
            return await GetAsyncTyped<List<StateProvince>>(countryStatesUrl);
        }

        public async Task<Country> GetCountryById(int countryId) => await _countries.GetCountryByCountryId(countryId);
    }
}

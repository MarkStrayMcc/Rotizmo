using Hero.Integration.CoreApi.Interfaces;
using Hero.Models.BlastZone;
using Hero.Models.Extensions;
using System.Text.Json;
using PropertyLimit = Hero.Models.PropertyLimit;

namespace Hero.Integration.BlastZoneApi;

public class BlastZoneApi : IBlastZoneApi
{
    private readonly HttpClient _httpClient;
    private readonly ILocationApi _locationApi;
    private const string _updateReservationEndPoint = "api/blast-zone-reservation-groups";
    private const string _checkCapacityEndpoint = "api/check-blast-zone-capacity";
    private const string _createReservationsEndPoint = "api/blast-zone-reservation-groups";

    public BlastZoneApi(HttpClient httpClient, ILocationApi locationApi, IConfiguration configuration)
    {
        httpClient.DefaultRequestHeaders.Add("Environment",  configuration.GetSection("FeatureFlag")["Environment"]);
        httpClient.DefaultRequestHeaders.Add("CipOrigin", "HERO");

        _httpClient = httpClient;
        _locationApi = locationApi;
        _httpClient.Timeout = TimeSpan.FromSeconds(300);
    }

    public async Task<BatchBlastZoneCreateResult> CreateBatchBlastZoneReservations(BatchBlastZoneCapacityCreate request)
    {
        var url = $"{_httpClient.BaseAddress}{_createReservationsEndPoint}";

        var response = await _httpClient.PostAsJsonAsync(url, request, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (response.IsSuccessStatusCode)
        {
            var batchBlastZoneCreateResult = await response.Content.ReadFromJsonAsync<BatchBlastZoneCreateResult>();
            return batchBlastZoneCreateResult;
        }
        return new BatchBlastZoneCreateResult();
    }

    public async Task<BatchBlastZoneCreateResult> UpdateBatchBlastZoneReservations(BatchBlastZoneCapacityCreate request)
    {
        var url = $"{_httpClient.BaseAddress}{_updateReservationEndPoint}/{request.Id}";

        var response = await _httpClient.PutAsJsonAsync(url, request, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (response.IsSuccessStatusCode)
        {
            var reservations = await response.Content.ReadFromJsonAsync<List<BlastZoneReservation>>();
            return new BatchBlastZoneCreateResult
            {
                Id = request.Id.Value,
                Reservations = reservations
            };
        }
        return new BatchBlastZoneCreateResult();
    }

    public async Task<List<BlastZoneWithPropertyLimitResult>> GetBatchBlastZoneCapacityCheck(
        BatchBlastZoneCapacityCheck request,
        IReadOnlyList<PropertyLimit> propertyLimits,
        decimal exchangeRate)
    {
        var url = $"{_httpClient.BaseAddress}{_checkCapacityEndpoint}";

        var response = await _httpClient.PostAsJsonAsync(url, request);

        var blastZoneReservationWithPropertyLimits = new List<BlastZoneWithPropertyLimitResult>();

        if (response.IsSuccessStatusCode)
        {
            var blastZoneReservations = await response.Content.ReadFromJsonAsync<List<BlastZoneReservation>>();
            foreach (var blastZoneReservation in blastZoneReservations)
            {
                var propertyLimit = propertyLimits.FirstOrDefault(pl => pl.RatingReference == blastZoneReservation.Id);
                if (propertyLimit is not null)
                    propertyLimit.ConversionRate = exchangeRate;

                blastZoneReservationWithPropertyLimits.Add(new BlastZoneWithPropertyLimitResult
                {
                    BlastZoneCapacityResult = blastZoneReservation,
                    PropertyLimit = propertyLimit,
                    FormattedAddress = await ToFormattedAddress(propertyLimit),
                    ConversionRate = exchangeRate,
                });
            }
        }

        return blastZoneReservationWithPropertyLimits;
    }

    public async Task<BlastZoneReservationGetResponse> GetBlastZoneReservations(Guid blastZoneReservationGroupId)
    {
        var url = $"{_httpClient.BaseAddress}api/{blastZoneReservationGroupId}";
        var response = await _httpClient.GetAsync(url);
        if (response.IsSuccessStatusCode)
        {
            var blastZoneReservationGetResponse = await response.Content.ReadFromJsonAsync<BlastZoneReservationGetResponse>();
            return blastZoneReservationGetResponse;
        }
        return new BlastZoneReservationGetResponse();
    }

    public async Task<bool> DeleteBlastZoneReservations(Guid blastZoneReservationGroupId)
    {
        var url = $"{_httpClient.BaseAddress}api/{blastZoneReservationGroupId}";
        var response = await _httpClient.DeleteAsync(url);
        if (response.IsSuccessStatusCode)
        {
            return true;
        }
        return false;
    }

    private async Task<string> ToFormattedAddress(PropertyLimit propertyLimit)
    {
        var country = await _locationApi.GetCountryById(propertyLimit.InsuredAddress.CountryId);
        var stateProvinceList = await _locationApi.GetCountryStatesByCountryId(propertyLimit.InsuredAddress.CountryId);
        var stateProvinceName = stateProvinceList == null ? string.Empty :
            stateProvinceList.FirstOrDefault(sp => sp.StateProvinceCode == propertyLimit.InsuredAddress.StateProvinceCode)?.Description;

        return ClientLocationExtensions.ToValidationAddress(propertyLimit.InsuredAddress.Address1,
            propertyLimit.InsuredAddress.City,
            stateProvinceName,
            propertyLimit.InsuredAddress.Postcode,
            country?.Name);
    }
}

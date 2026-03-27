using Hero.Integration.CurrencyConversion;
using Hero.Models.BlastZone;
using PropertyLimit = Hero.Models.PropertyLimit;

namespace Hero.Integration.BlastZoneApi;

internal sealed class BlastZoneService : IBlastZoneService
{
    private readonly IBlastZoneApi _blastZoneApi;
    private readonly ICurrencyConversionService _exchangeRateService;

    public BlastZoneService(IBlastZoneApi blastZoneApi, ICurrencyConversionService exchangeRateService)
    {
        _blastZoneApi = blastZoneApi;
        _exchangeRateService = exchangeRateService;
    }

    public async Task<List<BlastZoneWithPropertyLimitResult>> GetBatchBlastZoneCapacitiesWithPropertyLimits(PropertyLimitBlastZoneCapacityRequest request)
    {
        decimal currencyConversionRate = GetCurrencyConversionRate(request);
        BatchBlastZoneCapacityCheck batchRequest = CreateBatchBlastZoneCheckRequest(
            request.InceptionDate,
            request.ExpiryDate,
            request.PropertyLimits,
            request.FloatingValue,
            request.FirstLossLimitValue,
            request.OriginalGroupId,
            currencyConversionRate);

        return await _blastZoneApi.GetBatchBlastZoneCapacityCheck(batchRequest, request.PropertyLimits, currencyConversionRate);
    }

    public async Task<PropertyLimitBlastZoneCapacityResponse> UpdateBatchBlastZoneReservations(PropertyLimitBlastZoneCapacityRequest request)
    {
        decimal currencyConversionRate = GetCurrencyConversionRate(request);
        BatchBlastZoneCapacityCreate blastZoneCreateUpdateRequest = CreateAndUpdateBatchBlastZoneRequest(
            request.InceptionDate,
            request.ExpiryDate,
            request.PropertyLimits,
            request.FloatingValue,
            request.FirstLossLimitValue,
            request.ClientId.Value,
            request.ReservationExpiryDate.Value,
            request.IsRenewable,
            currencyConversionRate);

        var response = await _blastZoneApi.UpdateBatchBlastZoneReservations(blastZoneCreateUpdateRequest);

        return CreatePropertyLimitBlastZoneCapacityResponse(response, request.PropertyLimits, currencyConversionRate);
    }

    public async Task<PropertyLimitBlastZoneCapacityResponse> CreateBatchBlastZoneReservations(PropertyLimitBlastZoneCapacityRequest request)
    {
        decimal currencyConversionRate = GetCurrencyConversionRate(request);
        BatchBlastZoneCapacityCreate blastZoneCreateUpdateRequest = CreateAndUpdateBatchBlastZoneRequest(
            request.InceptionDate,
            request.ExpiryDate,
            request.PropertyLimits,
            request.FloatingValue,
            request.FirstLossLimitValue,
            request.ClientId.Value,
            request.ReservationExpiryDate.Value,
            request.IsRenewable,
            currencyConversionRate);

        var response = await _blastZoneApi.CreateBatchBlastZoneReservations(blastZoneCreateUpdateRequest);

        return CreatePropertyLimitBlastZoneCapacityResponse(response, request.PropertyLimits, currencyConversionRate);
    }

    public async Task<BlastZoneReservationGetResponse> GetBlastZoneReservations(Guid blastZoneReservationGroupId)
    {
        return await _blastZoneApi.GetBlastZoneReservations(blastZoneReservationGroupId);
    }

    public async Task<bool> DeleteBlastZoneReservations(Guid blastZoneReservationGroupId)
    {
        return await _blastZoneApi.DeleteBlastZoneReservations(blastZoneReservationGroupId);
    }

    private static PropertyLimitBlastZoneCapacityResponse CreatePropertyLimitBlastZoneCapacityResponse(
        BatchBlastZoneCreateResult response,
        IEnumerable<PropertyLimit> propertyLimits,
        decimal currencyConversionRate)
    {
        return new PropertyLimitBlastZoneCapacityResponse
        {
            BlastZoneCheckResult = response.Reservations.Any() && response.Reservations.All(r => r.HasCapacity),
            PropertyLimits = propertyLimits.Select(propertyLimit =>
            {
                propertyLimit.BlastZoneReservationId = response.Id;
                propertyLimit.ConversionRate = currencyConversionRate;
                return propertyLimit;
            }).ToList()
        };
    }

    private static BatchBlastZoneCapacityCreate CreateAndUpdateBatchBlastZoneRequest(
        DateTime inceptionDate,
        DateTime expiryDate,
        List<PropertyLimit> propertyLimits,
        decimal floatingValue,
        long? firstLossLimitValue,
        Guid clientId,
        DateTime reservationExpiryDate,
        bool isRenewable,
        decimal currencyConversionRate)
    {
        var blastZoneReservations = propertyLimits.Select(propertyLimit => new BlastZoneCapacityRequest
        {
            Location = GetLocationForBlastZoneCheck(propertyLimit.InsuredAddress),
            Id = propertyLimit.RatingReference!.Value,
            Exposure = ApplyCurrencyConversionRate(propertyLimit.TotalInsuredValue, currencyConversionRate),
        }).ToList();

        return new BatchBlastZoneCapacityCreate()
        {
            Id = propertyLimits.First().BlastZoneReservationId,
            ClientId = clientId,
            CapacityStartDate = ConvertToIsoDateOnlyString(inceptionDate),
            CapacityEndDate = ConvertToIsoDateOnlyString(expiryDate),
            FloatingValue = ApplyCurrencyConversionRate(floatingValue, currencyConversionRate),
            Reservations = blastZoneReservations,
            ReservationExpiryDate = ConvertToIsoDateOnlyString(reservationExpiryDate),
            IsRenewable = isRenewable,
            FirstLossLimit = ApplyCurrencyConversionRate(firstLossLimitValue, currencyConversionRate),
        };
    }

    private static BatchBlastZoneCapacityCheck CreateBatchBlastZoneCheckRequest(
        DateTime inceptionDate,
        DateTime expiryDate,
        List<PropertyLimit> propertyLimits,
        long floatingValue,
        long? firstLossLimitValue,
        Guid? originalGroupId,
        decimal currencyConversionRate)
    {
        var blastZoneReservations = propertyLimits.Select(propertyLimit => new BlastZoneCapacityRequest
        {
            Location = GetLocationForBlastZoneCheck(propertyLimit.InsuredAddress),
            Id = propertyLimit.RatingReference!.Value,
            Exposure = ApplyCurrencyConversionRate(propertyLimit.TotalInsuredValue, currencyConversionRate),

        }).ToList();

        return new BatchBlastZoneCapacityCheck()
        {
            CapacityStartDate = ConvertToIsoDateOnlyString(inceptionDate),
            CapacityEndDate = ConvertToIsoDateOnlyString(expiryDate),
            FloatingValue = ApplyCurrencyConversionRate(floatingValue, currencyConversionRate),
            Properties = blastZoneReservations,
            FirstLossLimit = ApplyCurrencyConversionRate(firstLossLimitValue, currencyConversionRate),
            OriginalGroupId = originalGroupId,
        };
    }

    private static long ApplyCurrencyConversionRate(decimal? value, decimal rate) =>
        (long)Math.Round(value.GetValueOrDefault() * rate, MidpointRounding.ToPositiveInfinity);

    private static string ConvertToIsoDateOnlyString(DateTime date)
    {
        return DateOnly.FromDateTime(date).ToString("O");
    }

    private static Location GetLocationForBlastZoneCheck(WebApiDto.Dto.ClientLocation insuredAddress)
    {
        var hasManualCoordinates = insuredAddress.OverriddenLatitude.HasValue &&
                                   insuredAddress.OverriddenLongitude.HasValue;

        return new Location
        {
            Latitude = hasManualCoordinates
                ? insuredAddress.OverriddenLatitude!.Value
                : insuredAddress.Latitude!.Value,
            Longitude = hasManualCoordinates
                ? insuredAddress.OverriddenLongitude!.Value
                : insuredAddress.Longitude!.Value
        };
    }

    private decimal GetCurrencyConversionRate(PropertyLimitBlastZoneCapacityRequest request) =>
        _exchangeRateService.GetConversionRate(request.BinderSectionId, request.QuoteCurrencyIsoCode);
}

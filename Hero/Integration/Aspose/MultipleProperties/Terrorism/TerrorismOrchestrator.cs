using System.Text.RegularExpressions;
using Aspose.Cells;
using FluentValidation;
using Hero.Integration.CoreApi;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.Extensions;
using Hero.Integration.Geolocation;
using Hero.Integration.PriorSubmit;
using Hero.Models;
using Hero.Models.Enums;
using Hero.Models.Extensions;
using Hero.Models.Geolocation;
using Hero.Models.Validation;
using WebApiDto.Enum;
using ClientLocation = Hero.Models.ClientLocation;
using ClientLocationProperties = Hero.Models.ClientLocationProperties;
using Country = WebApiDto.Dto.Country;
using PropertyLimit = Hero.Models.PropertyLimit;
using PropertyLimitFloatingValues = WebApiDto.Dto.PropertyLimitFloatingValues;
using TemplateConfig = Hero.Integration.Aspose.MultipleProperties.Terrorism.TemplateConfiguration;

namespace Hero.Integration.Aspose.MultipleProperties.Terrorism;

internal sealed partial class TerrorismOrchestrator : IMultiplePropertyOrchestrator
{
    private const string BuildingUseTag = "BuildingUse";
    private const string FormattedAddressTag = "FormattedAddress";
    private const double Tolerance = 0.00001; // Tolerance of 0.00001 degrees (~1.1m accuracy)
    private const int Uk = 1;

    private readonly ILogger<TerrorismOrchestrator> _logger;
    private readonly ILocationApi _locationApi;
    private readonly IAsposeRowExtractor _asposeRowExtractor;
    private readonly IAsposeRowInserter _asposeRowInserter;
    private readonly IGeolocationService _geolocationService;
    private readonly IValidator<LocationValidationRequest> _locationValidator;
    private readonly IValidator<FloatingValueValidationRequest> _floatingValueValidator;
    private Dictionary<int, string> _countryNames;
    private readonly IListOfCountries _countries;
    private readonly IPriorSubmitApprovalService _priorSubmitApprovalService;
    private readonly Regex _zoneAOutCodeRegex = new(@"[A-Z]+\d+");
    private readonly IReadOnlyDictionary<int, ExtractorColumnConfiguration> _columnConfigurations;
    private readonly ITemplateColumnValidator _templateColumnValidator;
    private const int _maximumLocationTivValue = 300000000;

    public TerrorismOrchestrator(
        ILogger<TerrorismOrchestrator> logger,
        ILocationApi locationApi,
        IAsposeRowExtractor asposeRowExtractor,
        IAsposeRowInserter asposeRowInserter,
        IGeolocationService geolocationService,
        IValidator<LocationValidationRequest> locationValidator,
        IValidator<FloatingValueValidationRequest> floatingValueValidator,
        IListOfCountries countries,
        IReadOnlyDictionary<int, ExtractorColumnConfiguration> columnConfigurations,
        ITemplateColumnValidator templateColumnValidator,
        IPriorSubmitApprovalService priorSubmitApprovalService)
    {
        _logger = logger;
        _locationApi = locationApi;
        _asposeRowExtractor = asposeRowExtractor;
        _asposeRowInserter = asposeRowInserter;
        _geolocationService = geolocationService;
        _locationValidator = locationValidator;
        _countries = countries;
        _floatingValueValidator = floatingValueValidator;
        _columnConfigurations = columnConfigurations;
        _templateColumnValidator = templateColumnValidator;
        _priorSubmitApprovalService = priorSubmitApprovalService;
    }

    public async Task<TemplateUploadResult> GetPropertyLimitsAsync(Workbook workbook, int clientId, int wordingVersionId)
    {
        (bool isValid, string error) = ValidateTemplateColumns(workbook, wordingVersionId);
        if (!isValid)
            return new TemplateUploadResult { TemplateValidationError = error };

        _countryNames = new Dictionary<int, string>();
        List<ValidationResult> validationResults = new();

        var firstSheetExtractedRows =
            _asposeRowExtractor.ExtractRows(workbook, _columnConfigurations[wordingVersionId]);
        var secondSheetExtractedRows =
            _asposeRowExtractor.ExtractRows(workbook, TemplateConfig.GetFloatingValuesColumnConfiguration(), 1, false);
        var thirdSheetExtractedRows =
            _asposeRowExtractor.ExtractRows(workbook, TemplateConfig.GetFirstLossLimitColumnConfiguration(), 2, false);

        var firstLossLimit = SetExtractFirstLossLimit(thirdSheetExtractedRows);

        var propertyFloatingValues = await SetExtractedPropertyFloatingValues(secondSheetExtractedRows, validationResults);
        var hasFloatingValues = floatingValuesHasCover(propertyFloatingValues);
        var propertyLimits = await SetExtractedPropertyLimitsAndValidationResults(firstSheetExtractedRows, propertyFloatingValues, validationResults, firstLossLimit, hasFloatingValues);

        await ProcessGeolocationForAddresses(propertyLimits, clientId, validationResults);

        await _priorSubmitApprovalService.EvaluateLocationsAsync(propertyLimits);

        return new TemplateUploadResult
        {
            PropertyLimits = propertyLimits,
            ValidationResults = validationResults,
            PropertyLimitFloatingValues = propertyFloatingValues,
            FirstLossLimitValue = firstLossLimit
        };
    }

    private static bool floatingValuesHasCover(PropertyLimitFloatingValues floatingValues) =>
        floatingValues != null && (floatingValues.ActualLossSustainedLimit > 0 ||
            floatingValues.ContentsDamageLimit > 0 ||
            floatingValues.IncreasedCostOfWorkingLimit > 0 ||
            floatingValues.LossOfRentLimit > 0 ||
            floatingValues.AlternativeAccommodationLimit > 0);

    private static int SetExtractFirstLossLimit(List<ExtractedRow> thirdSheetExtractedRows)
    {
        if (thirdSheetExtractedRows?.Count == 0) return 0;

        return thirdSheetExtractedRows.FirstOrDefault()?[TemplateConfig.FirstLossLimit].IntegerValue ?? 0;
    }

    private async Task<List<PropertyLimit>> SetExtractedPropertyLimitsAndValidationResults(List<ExtractedRow> firstSheetExtractedRows, PropertyLimitFloatingValues floatingValues, List<ValidationResult> validationResults, int firstLossLimit, bool hasFloatingValues)
    {
        var propertyLimits = new List<PropertyLimit>();

        var duplicateAddressKeys = IdentifyDuplicateAddressKeys(firstSheetExtractedRows);

        foreach (var firstSheetExtractedRow in firstSheetExtractedRows)
        {
            var location = CreateLocationRequestFrom(firstSheetExtractedRow);

            if (DuplicateAddressValidation(validationResults, location, duplicateAddressKeys, firstSheetExtractedRow)) continue;

            if (await CheckForInvalidValidationResults(validationResults, location, firstSheetExtractedRow)) continue;

            var country = await _countries.GetCountryByName(location.CountryName);
            _countryNames.TryAdd(country.CountryId, location.CountryName);

            var propertyLimit = new PropertyLimit
            {
                InsuredAddress = await CreateClientLocationFrom(location, country),

                PropertyDamageLimit = firstSheetExtractedRow[TemplateConfig.PropertyDamageLimit]?.IntegerValue ?? 0,
                ContentsDamageLimit = firstSheetExtractedRow[TemplateConfig.ContentsDamageLimit]?.IntegerValue ?? 0,
                ActualLossSustainedLimit = firstSheetExtractedRow[TemplateConfig.ActualLossSustainedLimit]?.IntegerValue ?? 0,
                IncreasedCostOfWorkingLimit = firstSheetExtractedRow[TemplateConfig.IncreasedCostOfWorkingLimit]?.IntegerValue ?? 0,
                LossOfRentLimit = firstSheetExtractedRow[TemplateConfig.LossOfRentLimit]?.IntegerValue ?? 0,
                AlternativeAccommodationLimit = firstSheetExtractedRow[TemplateConfig.AlternativeAccommodationLimit]?.IntegerValue ?? 0,
                StockDamageLimit = 0,
                RowNumber = firstSheetExtractedRow.RowNumber
            };
            var propertyTotalFloatingValues = hasFloatingValues
                ? floatingValues.ContentsDamageLimit.GetValueOrDefault() + floatingValues.ActualLossSustainedLimit.GetValueOrDefault() +
                  floatingValues.IncreasedCostOfWorkingLimit.GetValueOrDefault() + floatingValues.LossOfRentLimit.GetValueOrDefault() +
                  floatingValues.AlternativeAccommodationLimit.GetValueOrDefault()
                : 0;

            if ((propertyLimit.TotalInsuredValue + propertyTotalFloatingValues) > _maximumLocationTivValue && (firstLossLimit == 0 || firstLossLimit > _maximumLocationTivValue))
            {
                validationResults.Add(new ValidationResult
                {
                    LocationIdentifier = "Row " + firstSheetExtractedRow.RowNumber,
                    ValidationAddress = location.ToValidationAddress(),
                    Errors = new List<FluentValidation.Results.ValidationFailure> { new() { ErrorMessage = $"Location maximum limit of £{_maximumLocationTivValue:N0} has been exceeded" } }
                });
                continue;
            }

            if (!hasFloatingValues && propertyLimit.TotalInsuredValue == 0)
            {
                validationResults.Add(new ValidationResult
                {
                    LocationIdentifier = "Row " + firstSheetExtractedRow.RowNumber,
                    ValidationAddress = location.ToValidationAddress(),
                    Errors = new List<FluentValidation.Results.ValidationFailure> { new() { ErrorMessage = "No cover has been provided for this location" } }
                });
                continue;
            }

            propertyLimits.Add(propertyLimit);
        }
        return propertyLimits;
    }

    private static bool DuplicateAddressValidation(List<ValidationResult> validationResults, LocationValidationRequest location,
        HashSet<string> duplicateAddressKeys, ExtractedRow firstSheetExtractedRow)
    {
        var addressKey = $"{location.Address1?.Trim().ToUpperInvariant()}|{location.Postcode?.Trim().ToUpperInvariant()}";
        if (duplicateAddressKeys.Contains(addressKey))
        {
            validationResults.Add(new ValidationResult
            {
                LocationIdentifier = "Row " + firstSheetExtractedRow.RowNumber,
                ValidationAddress = location.ToValidationAddress(),
                Errors = new List<FluentValidation.Results.ValidationFailure> { new() { ErrorMessage = $"Duplicate address found for {location.Address1}, {location.Postcode}" } }
            });
            return true;
        }

        return false;
    }

    private static HashSet<string> IdentifyDuplicateAddressKeys(List<ExtractedRow> firstSheetExtractedRows)
    {
        var addressKeyToRows = new Dictionary<string, List<ExtractedRow>>(StringComparer.OrdinalIgnoreCase);
        foreach (var row in firstSheetExtractedRows)
        {
            var location = CreateLocationRequestFrom(row);
            var addressKey = $"{location.Address1?.Trim().ToUpperInvariant()}|{location.Postcode?.Trim().ToUpperInvariant()}";

            if (!addressKeyToRows.ContainsKey(addressKey))
            {
                addressKeyToRows[addressKey] = new List<ExtractedRow>();
            }
            addressKeyToRows[addressKey].Add(row);
        }

        var duplicateAddressKeys = addressKeyToRows.Where(kvp => kvp.Value.Count > 1).Select(kvp => kvp.Key).ToHashSet(StringComparer.OrdinalIgnoreCase);
        return duplicateAddressKeys;
    }

    private async Task<bool> CheckForInvalidValidationResults(List<ValidationResult> validationResults, LocationValidationRequest location,
        ExtractedRow firstSheetExtractedRow)
    {
        var validationResult = await _locationValidator.ValidateAsync(location);

        if (!validationResult.IsValid)
        {
            validationResults.Add(new ValidationResult
            {
                LocationIdentifier = "Row " + firstSheetExtractedRow.RowNumber,
                ValidationAddress = location.ToValidationAddress(),
                Errors = validationResult.Errors
            });
            return true;
        }

        return false;
    }

    private async Task<PropertyLimitFloatingValues> SetExtractedPropertyFloatingValues(
        List<ExtractedRow> secondSheetExtractedRows, List<ValidationResult> validationResults)
    {
        if (secondSheetExtractedRows.Count == 0) return null;

        var secondSheetExtractedRow = secondSheetExtractedRows.FirstOrDefault();
        var validationResult = await _floatingValueValidator.ValidateAsync(new FloatingValueValidationRequest { ExtractedFloatingValueRow = secondSheetExtractedRow });
        if (!validationResult.IsValid)
        {
            validationResults.Add(new ValidationResult
            {
                LocationIdentifier = "Floating Values",
                ValidationAddress = "",
                Errors = validationResult.Errors
            });
        }

        var propertyFloatingValues = new PropertyLimitFloatingValues
        {
            ContentsDamageLimit = secondSheetExtractedRow[TemplateConfig.ContentsDamageLimit].IntegerValue ?? 0,
            ActualLossSustainedLimit = secondSheetExtractedRow[TemplateConfig.ActualLossSustainedLimit].IntegerValue ?? 0,
            IncreasedCostOfWorkingLimit = secondSheetExtractedRow[TemplateConfig.IncreasedCostOfWorkingLimit].IntegerValue ?? 0,
            LossOfRentLimit = secondSheetExtractedRow[TemplateConfig.LossOfRentLimit].IntegerValue ?? 0,
            AlternativeAccommodationLimit = secondSheetExtractedRow[TemplateConfig.AlternativeAccommodationLimit].IntegerValue ?? 0,
        };

        return propertyFloatingValues;
    }

    private async Task<ClientLocation> CreateClientLocationFrom(LocationValidationRequest location, Country country)
    {
        var stateProvinceCode = await GetStateProvinceCode(location.StateProvince, country.IsoCode);

        var insuredAddress = new ClientLocation
        {
            StateProvinceCode = stateProvinceCode,
            CountryId = country.CountryId,
            Address1 = location.Address1,
            Address2 = location.Address2,
            City = location.City,
            County = location.County,
            Postcode = location.Postcode,
            ClientLocationProperties = new List<ClientLocationProperties>
            {
                AddNewLocationAttributeFor(location.BuildingUse, BuildingUseTag)
            }
        };

        if (location.Latitude != null && location.Longitude != null)
        {
            insuredAddress.OverriddenLatitude = location.Latitude;
            insuredAddress.OverriddenLongitude = location.Longitude;
        }

        return insuredAddress;
    }

    private static LocationValidationRequest CreateLocationRequestFrom(ExtractedRow extractedRow)
    {
        var row = extractedRow;
        var countryName = row[TemplateConfig.Country].StringValue;
        var address1 = row[TemplateConfig.AddressLine1].StringValue;
        var address2 = row[TemplateConfig.AddressLine2].StringValue;
        var city = row[TemplateConfig.TownOrCity].StringValue;
        var county = row[TemplateConfig.County].StringValue;
        var stateOrProvince = row[TemplateConfig.StateOrProvince].StringValue;
        var postcode = row[TemplateConfig.PostCode].StringValue;
        var latitude = row[TemplateConfig.Latitude].DoubleValue;
        var longitude = row[TemplateConfig.Longitude].DoubleValue;
        var buildingUse = row[TemplateConfig.BuildingUse].StringValue;

        var locationValidationRequest = new LocationValidationRequest
        {
            CountryName = countryName,
            Address1 = address1,
            Address2 = address2,
            Address3 = null,
            City = city,
            County = county,
            StateProvince = stateOrProvince,
            Postcode = postcode,
            Latitude = latitude,
            Longitude = longitude,
            BuildingUse = buildingUse
        };

        return locationValidationRequest;
    }

    public async Task<Workbook> InsertPropertyLimitsIntoWorkbook(Workbook workbook, IEnumerable<WebApiDto.Dto.PropertyLimit> propertyLimits,
        PropertyLimitFloatingValues propertyLimitFloatingValues, int? firstLossLimit, int wordingVersionId)
    {
        var locationExtractorColumnConfiguration = _columnConfigurations[wordingVersionId];
        var floatingValuesExtractorColumnConfiguration = TemplateConfig.GetFloatingValuesColumnConfiguration();
        var firstLossLimitExtractorColumnConfiguration = TemplateConfig.GetFirstLossLimitColumnConfiguration();

        List<ExtractedRow> locationRows = new();
        foreach (var propertyLimit in propertyLimits)
        {
            var locationRow = new ExtractedRow();
            for (int i = 0; i < locationExtractorColumnConfiguration.Columns.Count; i++)
            {
                ExtractorColumn column = locationExtractorColumnConfiguration.Columns[i];
                ExtractedCellValue? extractedCellValue = await GetLocationCellValue(propertyLimit, column);
                if (extractedCellValue is null)
                    continue;

                extractedCellValue.ColumnIndex = column.ColumnIndex ?? i;
                locationRow.CellValues.Add(extractedCellValue);
            }

            locationRows.Add(locationRow);
        }

        List<ExtractedRow> floatingValueRows = new();
        var floatingValueRow = new ExtractedRow();
        for (int i = 0; i < floatingValuesExtractorColumnConfiguration.Columns.Count; i++)
        {
            ExtractorColumn column = floatingValuesExtractorColumnConfiguration.Columns[i];
            ExtractedCellValue? extractedCellValue = GetFloatingValueCellValue(propertyLimitFloatingValues, column);
            if (extractedCellValue is null)
                continue;

            extractedCellValue.ColumnIndex = column.ColumnIndex ?? i;
            floatingValueRow.CellValues.Add(extractedCellValue);
        }

        floatingValueRows.Add(floatingValueRow);

        List<ExtractedRow> firstLossValueRows = new();
        var firstLossValueRow = new ExtractedRow();
        for (int i = 0; i < firstLossLimitExtractorColumnConfiguration.Columns.Count; i++)
        {
            ExtractorColumn column = firstLossLimitExtractorColumnConfiguration.Columns[i];
            ExtractedCellValue? extractedCellValue = GetFirstLossLimitCellValue(firstLossLimit, column);
            if (extractedCellValue is null)
                continue;

            extractedCellValue.ColumnIndex = column.ColumnIndex ?? i;
            firstLossValueRow.CellValues.Add(extractedCellValue);
        }

        firstLossValueRows.Add(firstLossValueRow);

        _asposeRowInserter.InsertRows(workbook, locationRows, locationExtractorColumnConfiguration, 0);
        _asposeRowInserter.InsertRows(workbook, floatingValueRows, floatingValuesExtractorColumnConfiguration, 1);
        _asposeRowInserter.InsertRows(workbook, firstLossValueRows, firstLossLimitExtractorColumnConfiguration, 2);

        return workbook;
    }

    private static (int, string) GetCountryDetails(string countryName, IReadOnlyCollection<Country> countries)
    {
        var countryId = countries.First(c => c.Name == countryName).CountryId;
        var countryCode = countries.First(c => c.Name == countryName).IsoCode;

        return (countryId, countryCode);
    }

    private static ClientLocationProperties AddNewLocationAttributeFor(string locationAttributeValue, string tag)
    {
        if (string.IsNullOrEmpty(locationAttributeValue)) return null;

        var buildingUse = locationAttributeValue?.Trim().ToUpperInvariant();
        if (Enum.IsDefined(typeof(BuildingUseTypes), buildingUse))
        {
            return new ClientLocationProperties() { Tag = tag, Value = buildingUse };
        }

        throw new InvalidBuildingUseException(
            $"{buildingUse} is invalid. Please use a value from {nameof(BuildingUseTypes)}");
    }

    private async Task<string> GetStateProvinceCode(string stateProvinceName, string countryCode)
    {
        if (string.IsNullOrEmpty(stateProvinceName))
        {
            return null;
        }

        var stateProvinceList = await _locationApi.GetCountryStates(countryCode);
        var stateProvinceCode =
            stateProvinceList.First(sp => sp.Description == stateProvinceName).StateProvinceCode;

        return stateProvinceCode;
    }

    private async Task<string> GetStateProvinceName(string stateProvinceCode, string countryCode)
    {
        if (string.IsNullOrEmpty(stateProvinceCode))
        {
            return null;
        }

        var stateProvinceList = await _locationApi.GetCountryStates(countryCode);
        var stateProvinceName =
            stateProvinceList.First(sp => sp.StateProvinceCode == stateProvinceCode).Description;

        return stateProvinceName;
    }

    private async Task<ExtractedCellValue?> GetLocationCellValue(WebApiDto.Dto.PropertyLimit propertyLimit, ExtractorColumn column)
    {
        ExtractedCellValue cellValue = new();
        cellValue.ColumnName = column.ColumnName;
        switch (column.ColumnName)
        {
            case TemplateConfig.ContentsDamageLimit:
                cellValue.IntegerValue = propertyLimit.ContentsDamageLimit;
                break;
            case TemplateConfig.PropertyDamageLimit:
                cellValue.IntegerValue = propertyLimit.PropertyDamageLimit;
                break;
            case TemplateConfig.LossOfRentLimit:
                cellValue.IntegerValue = propertyLimit.LossOfRentLimit;
                break;
            case TemplateConfig.ActualLossSustainedLimit:
                cellValue.IntegerValue = propertyLimit.ActualLossSustainedLimit;
                break;
            case TemplateConfig.IncreasedCostOfWorkingLimit:
                cellValue.IntegerValue = propertyLimit.IncreasedCostOfWorkingLimit;
                break;
            case TemplateConfig.AlternativeAccommodationLimit:
                cellValue.IntegerValue = propertyLimit.AlternativeAccommodationLimit;
                break;
            case TemplateConfig.Latitude:
                cellValue.DoubleValue = propertyLimit.InsuredAddress.OverriddenLatitude ?? propertyLimit.InsuredAddress.Latitude;
                break;
            case TemplateConfig.Longitude:
                cellValue.DoubleValue = propertyLimit.InsuredAddress.OverriddenLongitude ?? propertyLimit.InsuredAddress.Longitude;
                break;
            case TemplateConfig.Country:
                cellValue.StringValue = propertyLimit.InsuredAddress.Country.Name;
                break;
            case TemplateConfig.County:
                cellValue.StringValue = propertyLimit.InsuredAddress.County;
                break;
            case TemplateConfig.TownOrCity:
                cellValue.StringValue = propertyLimit.InsuredAddress.City;
                break;
            case TemplateConfig.AddressLine1:
                cellValue.StringValue = propertyLimit.InsuredAddress.Address1;
                break;
            case TemplateConfig.AddressLine2:
                cellValue.StringValue = propertyLimit.InsuredAddress.Address2;
                break;
            case TemplateConfig.BuildingUse:
                cellValue.StringValue = propertyLimit.InsuredAddress.ClientLocationProperties
                    .FirstOrDefault(property => property.Tag == BuildingUseTag)?.Value;
                break;
            case TemplateConfig.PostCode:
                cellValue.StringValue = propertyLimit.InsuredAddress.Postcode;
                break;
            case TemplateConfig.StateOrProvince:
                var stateProvinceName = await GetStateProvinceName(propertyLimit.InsuredAddress.StateProvinceCode,
                    propertyLimit.InsuredAddress.Country.IsoCode);
                cellValue.StringValue = stateProvinceName;
                break;
            default: return null;
        }

        return cellValue;
    }

    private ExtractedCellValue? GetFloatingValueCellValue(PropertyLimitFloatingValues propertyLimitFloatingValues, ExtractorColumn column)
    {
        ExtractedCellValue cellValue = new();
        cellValue.ColumnName = column.ColumnName;
        switch (column.ColumnName)
        {
            case TemplateConfig.ContentsDamageLimit:
                cellValue.IntegerValue = propertyLimitFloatingValues.ContentsDamageLimit;
                break;
            case TemplateConfig.LossOfRentLimit:
                cellValue.IntegerValue = propertyLimitFloatingValues.LossOfRentLimit;
                break;
            case TemplateConfig.ActualLossSustainedLimit:
                cellValue.IntegerValue = propertyLimitFloatingValues.ActualLossSustainedLimit;
                break;
            case TemplateConfig.IncreasedCostOfWorkingLimit:
                cellValue.IntegerValue = propertyLimitFloatingValues.IncreasedCostOfWorkingLimit;
                break;
            case TemplateConfig.AlternativeAccommodationLimit:
                cellValue.IntegerValue = propertyLimitFloatingValues.AlternativeAccommodationLimit;
                break;

            default: return null;
        }

        return cellValue;
    }

    private ExtractedCellValue? GetFirstLossLimitCellValue(int? firstLossLimit, ExtractorColumn column)
    {
        ExtractedCellValue cellValue = new();
        cellValue.ColumnName = column.ColumnName;
        switch (column.ColumnName)
        {
            case TemplateConfig.FirstLossLimit:
                cellValue.IntegerValue = firstLossLimit;
                break;

            default: return null;
        }

        return cellValue;
    }

    private async Task ProcessGeolocationForAddresses(IReadOnlyCollection<PropertyLimit> propertyLimits, int clientId, List<ValidationResult> validationResults)
    {
        if (propertyLimits.Count == 0) return;

        var clientLocations = await GetLatestDistinctClientLocations(clientId);
        var geoLocatedClientLocations = await GeolocateClientLocations(clientLocations);

        var propertyLimitGeolocationResults = await Task.WhenAll(propertyLimits
        .Select(limit => GeolocateClientLocation(limit.InsuredAddress, true,
                                                ClientLocationExtensions.ToValidationAddress(limit.InsuredAddress.Address1, limit.InsuredAddress.City,
                                                                                             limit.InsuredAddress.StateProvinceCode, limit.InsuredAddress.Postcode,
                                                                                             string.Empty),
                                                limit.RowNumber, validationResults))
        );

        UpdatePropertyLimitsWithGeolocationResults(propertyLimits, propertyLimitGeolocationResults);
        if (geoLocatedClientLocations.Count > 0)
        {
            UpdatePropertyLimitsWithClientLocationData(propertyLimits, propertyLimitGeolocationResults,
            geoLocatedClientLocations);
        }
    }
    private async Task<List<WebApiDto.Dto.ClientLocation>> GetLatestDistinctClientLocations(int clientId)
    {
        var clientLocations = await _locationApi.GetAsync(clientId);
        var distinctClientLocations = clientLocations.OrderByDescending(x => x.ClientLocationId)
        .DistinctBy(x => x.ToFullAddress(_countryNames)).ToList();
        return distinctClientLocations;
    }
    private void UpdatePropertyLimitsWithGeolocationResults(IReadOnlyCollection<PropertyLimit> propertyLimits,
    IEnumerable<GeolocationResult> geolocationResults)
    {
        foreach (var result in geolocationResults.Where(r => r.Success))
        {
            var matchedPropertyLimits = propertyLimits.Where(pl =>
                pl.InsuredAddress.ToFullAddress(_countryNames) == result.QueriedAddress);

            foreach(var propertyLimit in matchedPropertyLimits)
            {
                propertyLimit.InsuredAddress.Latitude = result.Latitude;
                propertyLimit.InsuredAddress.Longitude = result.Longitude;
                propertyLimit.InsuredAddress.Precision = result.Precision;

                ClearOverriddenCoordinatesIfTheyMatchGoogleApiGeolocation(propertyLimit.InsuredAddress, result);

                var formattedAddress = result.FormattedAddress;
                if(!string.IsNullOrWhiteSpace(formattedAddress))
                {
                    var properties = propertyLimit.InsuredAddress.ClientLocationProperties.ToList();
                    properties.Add(new ClientLocationProperties { Tag = FormattedAddressTag, Value = formattedAddress });
                    propertyLimit.InsuredAddress.ClientLocationProperties = properties;
                }
            }
        }
    }

    private static void ClearOverriddenCoordinatesIfTheyMatchGoogleApiGeolocation(WebApiDto.Dto.ClientLocation insuredAddress,
        GeolocationResult result)
    {
        if (insuredAddress.OverriddenLatitude.HasValue &&
            insuredAddress.OverriddenLongitude.HasValue &&
            CoordinatesAreEqual(insuredAddress.OverriddenLatitude.Value, result.Latitude) &&
            CoordinatesAreEqual(insuredAddress.OverriddenLongitude.Value, result.Longitude))
        {
            insuredAddress.OverriddenLatitude = null;
            insuredAddress.OverriddenLongitude = null;
        }
    }

    private static bool CoordinatesAreEqual(double coordinate1, double coordinate2)
    {
        return Math.Abs(coordinate1 - coordinate2) < Tolerance;
    }

    private void UpdatePropertyLimitsWithClientLocationData(IReadOnlyCollection<PropertyLimit> propertyLimits,
        IEnumerable<GeolocationResult> geolocationResults,
        Dictionary<GeolocationResult, WebApiDto.Dto.ClientLocation> geolocatedClientLocations)
    {
        foreach (var geoLocationResult in geolocationResults)
        {
            var clientGeoLocationResultKeyValuePair =
                geolocatedClientLocations.FirstOrDefault(x =>
                    x.Key.FormattedAddress == geoLocationResult.FormattedAddress && x.Value.Address1 == geoLocationResult.AddressLine1);

            if (clientGeoLocationResultKeyValuePair.Value is null) continue;
            var propertyLimit = propertyLimits.First(pl =>
                pl.InsuredAddress.ToFullAddress(_countryNames) == geoLocationResult.QueriedAddress);

            if (IsGeolocationConflict(clientGeoLocationResultKeyValuePair, propertyLimit)) continue;

            propertyLimit.InsuredAddress.ClientLocationId = clientGeoLocationResultKeyValuePair.Value.ClientLocationId;
        }
    }

    private static bool IsGeolocationConflict(
        KeyValuePair<GeolocationResult, WebApiDto.Dto.ClientLocation> clientGeoLocationResultKeyValuePair,
        PropertyLimit propertyLimit)
    {
        var existingLocation = clientGeoLocationResultKeyValuePair.Value;

        // 1. Does existing have GeoLocation data?
        if (existingLocation.Latitude is null &&
            existingLocation.Longitude is null)
        {
            return false;
        }

        // 2. Does existing conflict with incoming?
        return existingLocation.Latitude != propertyLimit.InsuredAddress.Latitude ||
               existingLocation.Longitude != propertyLimit.InsuredAddress.Longitude;
    }

    private async Task<Dictionary<GeolocationResult, WebApiDto.Dto.ClientLocation>> GeolocateClientLocations(
        List<WebApiDto.Dto.ClientLocation> clientLocations)
    {
        if (clientLocations.Count == 0)
        {
            return new();
        }

        var clientLocationGeoLocationResults = await Task.WhenAll(clientLocations
            .Select(location => GeolocateClientLocation(location, false)));

        return clientLocations.ToDictionary(clientLocation => clientLocationGeoLocationResults.First(
            r => r.QueriedAddress == clientLocation.ToFullAddress(_countryNames)), clientLocation => clientLocation);
    }

    private async Task<GeolocationResult> GeolocateClientLocation(WebApiDto.Dto.ClientLocation clientLocation, bool isNewAddress, string validationAddress = null, int rowNumber = 0, List<ValidationResult> validationResults = null)
    {
        var clientLocationAddress = clientLocation.ToFullAddress(_countryNames);
        var geolocationResult = await _geolocationService.GetAsync(clientLocationAddress);

        var hasSpreadsheetSuppliedLatitudeAndLongitude = (clientLocation.OverriddenLatitude.HasValue && clientLocation.OverriddenLongitude.HasValue);
        ValidatePropertyInZoneA(clientLocation, geolocationResult, hasSpreadsheetSuppliedLatitudeAndLongitude);

        if (isNewAddress && !hasSpreadsheetSuppliedLatitudeAndLongitude && !string.IsNullOrWhiteSpace(geolocationResult.ErrorMessage))
        {
            AddValidationResult(validationResults, validationAddress, rowNumber, geolocationResult.ErrorMessage);
        }

        geolocationResult.AddressLine1 = clientLocation.Address1;

        return geolocationResult;
    }

    private void ValidatePropertyInZoneA(
        WebApiDto.Dto.ClientLocation clientLocation, GeolocationResult geolocationResult, bool hasSpreadsheetSuppliedLatitudeAndLatitude)
    {
        var isZoneA = IsZoneAAddress(clientLocation);
        var isNotRooftopPrecision = geolocationResult.Precision is not "ROOFTOP";

        if (isZoneA && isNotRooftopPrecision && !hasSpreadsheetSuppliedLatitudeAndLatitude)
        {
            geolocationResult.ErrorMessage = "Geolocated Zone A address returned does not provide rooftop-level precision";
            geolocationResult.Success = false;
        }
    }

    private bool IsZoneAAddress(WebApiDto.Dto.ClientLocation clientLocation)
    {
        if (clientLocation.CountryId != Uk)
        {
            return false;
        }

        var whitespaceRemovedPostcode = clientLocation.Postcode.RemoveWhitespace().ToUpperInvariant();
        var ukInCodeLength = 3;
        var ukPostCodeLength = 5;
        var outCode = whitespaceRemovedPostcode.Length >= ukPostCodeLength ? whitespaceRemovedPostcode[..^ukInCodeLength] : whitespaceRemovedPostcode;
        var outCodeTrailingAlphabeticalCharacterRemoved = _zoneAOutCodeRegex.IsMatch(outCode) ? _zoneAOutCodeRegex.Matches(outCode).Single().Value :string.Empty;

        return LondonZoneAPostCodes.PostCodes.Contains(outCodeTrailingAlphabeticalCharacterRemoved);
    }

    private static void AddValidationResult(List<ValidationResult> validationResults, string validationAddress, int rowNumber, string errorMessage)
    {
        validationResults.Add(new ValidationResult
        {
            LocationIdentifier = "Row " + rowNumber,
            ValidationAddress = validationAddress,
            Errors = new List<FluentValidation.Results.ValidationFailure> { new() { ErrorMessage = errorMessage } }
        });
    }

    private (bool isValid, string error) ValidateTemplateColumns(Workbook workbook, int wordingVersionId)
    {
        if (!_columnConfigurations.TryGetValue(wordingVersionId, out ExtractorColumnConfiguration? expectedConfig))
        {
            LogTemplateConfigNotFound(_logger, wordingVersionId, workbook.FileName);
            return (false, "Template configuration not found for selected wording version");
        }

        if (workbook.Worksheets.Count == 0)
        {
            LogTemplateHasNoWorksheets(_logger, workbook.FileName);
            return (false, "Template does not contain any worksheets");
        }

        return _templateColumnValidator.Validate(workbook.Worksheets[0], expectedConfig);
    }

    [LoggerMessage(
        EventId = 0,
        Level = LogLevel.Error,
        Message = "Template column configuration not found for wording version {WordingVersionId}; filename: {TemplateFilename}")]
    static partial void LogTemplateConfigNotFound(ILogger logger, int wordingVersionId, string templateFilename);

    [LoggerMessage(EventId = 1, Level = LogLevel.Error, Message = "Template does not contain any worksheets; filename: {TemplateFilename}")]
    static partial void LogTemplateHasNoWorksheets(ILogger logger, string templateFilename);
}

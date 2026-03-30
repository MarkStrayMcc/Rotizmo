using Aspose.Cells;
using FluentValidation;
using Hero.Integration.Aspose;
using Hero.Integration.Aspose.MultipleProperties;
using Hero.Integration.Aspose.MultipleProperties.Terrorism;
using Hero.Integration.CoreApi;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.Geolocation;
using Hero.Models;
using Hero.Models.Extensions;
using Hero.Models.Geolocation;
using Hero.Models.Validation;
using Hero.Models.Validation.Validators;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Testing;
using Hero.Integration.PriorSubmit;
using ClientLocation = WebApiDto.Dto.ClientLocation;
using ClientLocationProperties = WebApiDto.Dto.ClientLocationProperties;
using Country = WebApiDto.Dto.Country;
using PropertyLimitFloatingValues = WebApiDto.Dto.PropertyLimitFloatingValues;
using StateProvince = WebApiDto.Dto.StateProvince;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
#pragma warning disable CS8604 // Possible null reference argument.
#pragma warning disable CS8629 // Nullable value type may be null.
#pragma warning disable CS8602 // Dereference of a possibly null reference.

namespace Hero.Tests.PropertyTemplate;

[TestFixture]
public class TerrorismOrchestratorTests
{
    private const int WordingVersionId = 1;

    private TerrorismOrchestrator _subject;
    private ICountryApi _mockCountryApi;
    private ILocationApi _mockLocationApi;
    private Workbook _workbook;
    private IAsposeRowInserter _mockAsposeRowInserter;
    private IAsposeRowExtractor _mockAsposeRowExtractor;
    private List<Models.PropertyLimit> _propertyLimits;
    private IGeolocationService _mockGeolocationService;
    private IValidator<LocationValidationRequest> _locationValidator;
    private IValidator<FloatingValueValidationRequest> _floatingValueValidator;
    private readonly int _clientId = 1;
    private IListOfCountries _listOfCountries;
    private ITemplateColumnValidator _templateColumnValidator;
    private FakeLogger<TerrorismOrchestrator> _logger;
    private IPriorSubmitApprovalService _mockPriorSubmitApprovalService;

    [SetUp]
    public void SetUp()
    {
        _logger = new FakeLogger<TerrorismOrchestrator>();
        _mockCountryApi = Substitute.For<ICountryApi>();
        _mockCountryApi.GetAsync().Returns(new List<Country>
        {
            new Country { CountryId = 1, Name = "UK", IsoCode = "GB" },
            new Country { CountryId = 4, Name = "US", IsoCode = "US" }
        });
        var cache = new MemoryCache(new MemoryCacheOptions());
        _listOfCountries = new ListOfCountries(_mockCountryApi, cache);

        _mockLocationApi = Substitute.For<ILocationApi>();
        _mockLocationApi.GetCountryStates("US").Returns(new List<StateProvince>
            { new StateProvince { Description = "District of Columbia", StateProvinceCode = "DC", CountryId = 4 } });
        _mockLocationApi.GetCountryStates("GB").Returns(new List<StateProvince>());
        _mockLocationApi.GetAsync(Arg.Any<int>())
            .Returns(new List<ClientLocation>());
        _workbook = new Workbook();
        SeedValidHeaderRow(_workbook);
        _mockAsposeRowInserter = Substitute.For<IAsposeRowInserter>();
        _mockAsposeRowExtractor = Substitute.For<IAsposeRowExtractor>();
        _mockGeolocationService = Substitute.For<IGeolocationService>();
        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(new GeolocationResult
        {
            Success = false,
        });

        _locationValidator = new LocationValidationRequestValidator(_listOfCountries, _mockLocationApi);
        _floatingValueValidator = new FloatingValueValidator();
        _mockPriorSubmitApprovalService = Substitute.For<IPriorSubmitApprovalService>();
        _mockPriorSubmitApprovalService.EvaluateLocationsAsync(Arg.Any<IList<Models.PropertyLimit>>()).Returns(Task.CompletedTask);
        _templateColumnValidator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());
        _templateColumnValidator = Substitute.For<ITemplateColumnValidator>();
        _templateColumnValidator.Validate(Arg.Any<Worksheet>(), Arg.Any<ExtractorColumnConfiguration>())
            .Returns((true, string.Empty));

        var columnConfigurations = new Dictionary<int, ExtractorColumnConfiguration>
        {
            { WordingVersionId, new ExtractorColumnConfiguration(TestColumnConfiguration.Columns, 2) },
        };

        _subject = new TerrorismOrchestrator(
            _logger,
            _mockLocationApi,
            _mockAsposeRowExtractor,
            _mockAsposeRowInserter,
            _mockGeolocationService,
            _locationValidator,
            _floatingValueValidator,
            _listOfCountries,
            columnConfigurations,
            _templateColumnValidator,
            _mockPriorSubmitApprovalService);

        _propertyLimits = TestFixtures.GetPropertyLimits();

        _mockAsposeRowExtractor.ExtractRows(_workbook, Arg.Any<ExtractorColumnConfiguration>(), 0, Arg.Any<bool>())
             .Returns(new List<ExtractedRow>());
        _mockAsposeRowExtractor.ExtractRows(_workbook, Arg.Any<ExtractorColumnConfiguration>(), 1, Arg.Any<bool>())
            .Returns(new List<ExtractedRow>());
        _mockAsposeRowExtractor.ExtractRows(_workbook, Arg.Any<ExtractorColumnConfiguration>(), 2, Arg.Any<bool>())
            .Returns(new List<ExtractedRow>());
    }

    private void SetUpMockAsposeRowExtractor(params List<ExtractedRow>[] extractedRowsForSheet)
    {
        for (var i = 0; i < extractedRowsForSheet.Length; i++)
        {
            _mockAsposeRowExtractor.ExtractRows(_workbook, Arg.Any<ExtractorColumnConfiguration>(), i, Arg.Any<bool>())
                .Returns(extractedRowsForSheet[i]);
        }
    }

    private static void SeedValidHeaderRow(Workbook workbook)
    {
        const int headerRowIndex = 1;

        Worksheet? worksheet = workbook.Worksheets[0];
        for (int i = 0; i < TestColumnConfiguration.Columns.Count; i++)
            worksheet.Cells[headerRowIndex, i].PutValue(TestColumnConfiguration.Columns[i].ColumnName);
    }

    [Test]
    public async Task GivenAnEmptyWorkbook_WhenIGetPropertyLimits_ThenIShouldHaveAnEmptyListOfPropertyLimits()
    {
        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.Should().NotBeNull();
        result.PropertyLimits.Should().BeEmpty();
    }

    [Test]
    public async Task GivenAnEmptyWorkbook_WhenIGetPropertyLimitFloatingValues_ThenIShouldHaveAnEmptyPropertyLimitFloatingValues()
    {
        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.Should().NotBeNull();
        result.PropertyLimits.Should().BeEmpty();
        result.PropertyLimitFloatingValues.Should().BeNull();
        result.FirstLossLimitValue.Should().Be(0);
    }

    [Test]
    public async Task GivenMissingColumnConfiguration_WhenIGetPropertyLimits_ThenErrorIsLogged()
    {
        const int wordingVersionId = 100;

        using var workbook = new Workbook();

        _ = await _subject.GetPropertyLimitsAsync(workbook, _clientId, wordingVersionId);

        _logger.Collector.Count.Should().Be(1);
        _logger.LatestRecord.Level.Should().Be(LogLevel.Error);
        _logger.LatestRecord.Message.Should().StartWith($"Template column configuration not found for wording version {wordingVersionId}");
    }

    [Test]
    public async Task GivenMissingColumnConfiguration_WhenIGetPropertyLimits_ThenTemplateValidationErrorIsReturned()
    {
        using var workbook = new Workbook();

        TemplateUploadResult result = await _subject.GetPropertyLimitsAsync(workbook, _clientId, 100);

        result.TemplateValidationError.Should().NotBeNull();
        result.TemplateValidationError.Should().StartWith($"Template configuration not found for selected wording version");
    }

    [Test]
    public async Task GivenMissingWorksheets_WhenIGetPropertyLimits_ThenErrorIsLogged()
    {
        using var workbook = new Workbook();
        workbook.Worksheets.Clear();

        _ = await _subject.GetPropertyLimitsAsync(workbook, _clientId, WordingVersionId);

        _logger.Collector.Count.Should().Be(1);
        _logger.LatestRecord.Level.Should().Be(LogLevel.Error);
        _logger.LatestRecord.Message.Should().StartWith("Template does not contain any worksheets");
    }

    [Test]
    public async Task GivenMissingWorksheets_WhenIGetPropertyLimits_ThenTemplateValidationErrorIsReturned()
    {
        using var workbook = new Workbook();
        workbook.Worksheets.Clear();

        TemplateUploadResult result = await _subject.GetPropertyLimitsAsync(workbook, _clientId, WordingVersionId);

        result.TemplateValidationError.Should().NotBeNull();
        result.TemplateValidationError.Should().Be("Template does not contain any worksheets");
    }

    [Test]
    public async Task GivenAWorkbookWithUnexpectedHeaderColumns_WhenIGetPropertyLimits_ThenTemplateValidationErrorIsReturned()
    {
        const int headerRowIndex = 1;

        Worksheet? worksheet = _workbook.Worksheets[0];
        worksheet.Cells[headerRowIndex, TestColumnConfiguration.Columns.Count].PutValue("ExtraColumn");

        _templateColumnValidator.Validate(Arg.Any<Worksheet>(), Arg.Any<ExtractorColumnConfiguration>())
            .Returns((false, TemplateColumnValidator.TemplateMismatch));

        TemplateUploadResult result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        result.TemplateValidationError.Should().NotBeNull();
        result.TemplateValidationError.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [TestCase(301000000, 301000000, 1, "Location maximum limit of £300,000,000 has been exceeded")]
    [TestCase(301000000, 0, 1, "Location maximum limit of £300,000,000 has been exceeded")]
    [TestCase(250000000, 301000000, 0, "PASSED")]
    [TestCase(301000000, 250000000, 0, "PASSED")]
    [TestCase(301000000, 300000000, 0, "PASSED")]
    [TestCase(300000000, 300000000, 0, "PASSED")]
    public async Task GivenAWorkbook_WhenIGetPropertyDeclaredValueAbove300MillionAndFirstLossLimitAbove300Million_ThenIShouldDisplayAnError(int totalInsuredValue, int firstLossLimit, int validationErrors, string errorMessage)
    {
        // Arrange
        SetUpMockAsposeRowExtractor(TestFixtures.StubListOfExtractedRowsForTemplate_TotalInsuredValue(totalInsuredValue), new List<ExtractedRow>(),
                                    TestFixtures.StubListOfExtractedRowsForFirstLossLimit(firstLossLimit));

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.Should().NotBeNull();

        result.FirstLossLimitValue.Should().Be(firstLossLimit);

        result.ValidationResults.Count.Should().Be(validationErrors);

        var errorMessageFromResult = validationErrors == 1 ? result.ValidationResults.First()
            .Errors.First()
            .ErrorMessage : "PASSED";

        errorMessageFromResult.Should().Be(errorMessage);
    }

    [TestCaseSource(typeof(TestFixtures), nameof(TestFixtures.GetFloatingValuesTestCases))]
    public async Task GivenAWorkbook_WhenIGetPropertyDeclaredValueAndFloatingValuesCombinedAbove300Million_ThenIShouldDisplayAnError(
        int totalInsuredValue, PropertyLimitFloatingValues floatingValues, int validationErrors, string errorMessage)
    {
        // Arrange
        SetUpMockAsposeRowExtractor(TestFixtures.StubListOfExtractedRowsForTemplate_TotalInsuredValue(totalInsuredValue), 
            TestFixtures.StubListOfExtractedRowsForFloatingValues(floatingValues), new List<ExtractedRow>());

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.Should().NotBeNull();

        result.PropertyLimitFloatingValues.Should().BeEquivalentTo(floatingValues);

        result.ValidationResults.Count.Should().Be(validationErrors);

        var errorMessageFromResult = validationErrors == 1 ? result.ValidationResults.First()
            .Errors.First()
            .ErrorMessage : "PASSED";

        errorMessageFromResult.Should().Be(errorMessage);
    }

    [Test]
    public async Task GivenAWorkbook_WhenIGetPropertyLimitFloatingValues_ThenIShouldHaveAPopulatedPropertyLimitFloatingValues()
    {
        // Arrange
        SetUpMockAsposeRowExtractor(new List<ExtractedRow>(), TestFixtures.StubListOfExtractedRowsForFloatingValues());

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.Should().NotBeNull();

        result.PropertyLimitFloatingValues.ContentsDamageLimit.Value.Should().Be(60000);
        result.PropertyLimitFloatingValues.ActualLossSustainedLimit.Value.Should().Be(1000);
        result.PropertyLimitFloatingValues.IncreasedCostOfWorkingLimit.Value.Should().Be(3000);
        result.PropertyLimitFloatingValues.LossOfRentLimit.Value.Should().Be(5000);
        result.PropertyLimitFloatingValues.AlternativeAccommodationLimit.Value.Should().Be(6000);
    }

    [Test]
    public async Task GivenAWorkbook_WhenFirstLossLimits_ThenIShouldHaveAPopulatedFirstLossLimitValues()
    {
        // Arrange
        SetUpMockAsposeRowExtractor(new List<ExtractedRow>(), new List<ExtractedRow>(), TestFixtures.StubListOfExtractedRowsForFirstLossLimit(123000));

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.Should().NotBeNull();

        result.FirstLossLimitValue.Value.Should().Be(123000);
    }

    [Test]
    public async Task GivenAWorkbook_WhenIGetPropertyLimits_ThenIShouldHaveAPopulatedListOfPropertyLimits()
    {
        // Arrange
        SetUpMockAsposeRowExtractor(TestFixtures.StubListOfExtractedRows(), new List<ExtractedRow>());

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.Should().NotBeNull();
        result.PropertyLimits.Should().NotBeEmpty();
        result.PropertyLimits.Count.Should().Be(3);

        var firstResult = result.PropertyLimits.FirstOrDefault();
        var firstPropertyLimit = _propertyLimits.FirstOrDefault();
        var expectedTotalInsuredValue = firstPropertyLimit.ContentsDamageLimit +
                                        firstPropertyLimit.PropertyDamageLimit +
                                        firstPropertyLimit.ActualLossSustainedLimit.GetValueOrDefault() +
                                        firstPropertyLimit.IncreasedCostOfWorkingLimit.GetValueOrDefault() +
                                        firstPropertyLimit.LossOfRentLimit.GetValueOrDefault() +
                                        firstPropertyLimit.AlternativeAccommodationLimit.GetValueOrDefault();

        firstResult.IncreasedCostOfWorkingLimit.Value.Should().Be(firstPropertyLimit.IncreasedCostOfWorkingLimit);
        firstResult.ActualLossSustainedLimit.Value.Should().Be(firstPropertyLimit.ActualLossSustainedLimit);
        firstResult.ContentsDamageLimit.Should().Be(firstPropertyLimit.ContentsDamageLimit);
        firstResult.LossOfRentLimit.Should().Be(firstPropertyLimit.LossOfRentLimit);
        firstResult.AlternativeAccommodationLimit.Should().Be(firstPropertyLimit.AlternativeAccommodationLimit);
        firstResult.PropertyDamageLimit.Should().Be(firstPropertyLimit.PropertyDamageLimit);
        firstResult.StockDamageLimit.Should().Be(firstPropertyLimit.StockDamageLimit);
        firstResult.InsuredAddress.Should().NotBeNull();
        firstResult.InsuredAddress.CountryId.Should().Be(firstPropertyLimit.InsuredAddress.CountryId);
        firstResult.RatingReference.Should().NotBeEmpty();
        firstResult.TotalInsuredValue.Should().Be(expectedTotalInsuredValue);
    }

    [Test]
    public async Task GivenAWorkbook_WhenIGetPropertyLimitWithInvalidClientLocations_ThenIShouldOnlyGetValidPropertyLimits()
    {
        // Arrange
        SetUpMockAsposeRowExtractor(TestFixtures.StubListOfExtractedRowsWithsomeInvalidClientLocations(), new List<ExtractedRow>());

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.Should().NotBeNull();
        result.PropertyLimits.Should().NotBeEmpty();
        result.PropertyLimits.Count.Should().Be(1);

        var firstResult = result.PropertyLimits.FirstOrDefault();
        var firstPropertyLimit = _propertyLimits.FirstOrDefault();
        var validationResults = result.ValidationResults;

        firstResult.InsuredAddress.Should().NotBeNull();
        firstResult.InsuredAddress.CountryId.Should().Be(firstPropertyLimit.InsuredAddress.CountryId);

        validationResults.Should().NotBeNull();
        validationResults.Count.Should().Be(2);
        validationResults[0].Errors.Count.Should().Be(3);
        validationResults[1].Errors.Count.Should().Be(2);
    }

    [Test]
    public async Task GivenAWorkbookAndItHasAnInvalidBuildingUse_WhenIGetPropertyLimits_ThenItShouldThrowAValidationException()
    {
        // Arrange
        const string invalidBuildingUse = "RESIDENTIAL,";

        var extractedRows = TestFixtures.StubListOfExtractedRows()
            .AddAdditionalRows(TestFixtures.CreateExtractedRow("37188", addressLine1: "1700 Pennsylvania Avenue", buildingUse: invalidBuildingUse));

        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        // Act
        // Assert
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);
        var validationResults = result.ValidationResults;
        validationResults.Should().NotBeNull();
        validationResults[0].Errors[0].ErrorMessage.Should().Be("Invalid building use value");
    }

    [Test]
    public async Task GivenAWorkbookAndItHasAnDuplicateAddresses_WhenIGetPropertyLimits_ThenItShouldNotThrowAValidationException()
    {
        // Arrange
        var extractedRows = new List<ExtractedRow>
        {
            TestFixtures.StubListOfExtractedRows().First(),
            TestFixtures.StubListOfExtractedRows().First()
        };

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);
        var validationResults = result.ValidationResults;

        // Assert
        validationResults.Should().BeEmpty();
    }

    [Test]
    public void GivenAWorkbookHasAValidBuildingUseButInTheWrongCase_WhenIGetPropertyLimits_ThenDoesntThrowValidationException()
    {
        // Arrange
        const string validBuildingUseWithTheWrongCase = "residential";
        var extractedRows = TestFixtures.StubListOfExtractedRows()
            .AddAdditionalRows(TestFixtures.CreateExtractedRow("37188", buildingUse: validBuildingUseWithTheWrongCase));

        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());
        // Act
        // Assert
        Assert.DoesNotThrowAsync(async () => await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId));
    }

    [Test]
    public async Task GivenAWorkbook_WhenIGetPropertyLimits_ThenAICOWAndLossOfRentLimitShouldBeNull()
    {
        // Arrange
        SetUpMockAsposeRowExtractor(TestFixtures.StubListOfExtractedRows(), new List<ExtractedRow>());

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.Should().NotBeNull();
        result.PropertyLimits.Should().NotBeEmpty();
        result.PropertyLimits.Count.Should().Be(3);

        var firstResult = result.PropertyLimits.FirstOrDefault();
        var firstPropertyLimit = _propertyLimits.FirstOrDefault();

        firstResult.GrossRentalLimit.Should().Be(null);
        firstResult.AdditionalIncreasedCostOfWorkingLimit.Should().Be(null);
    }

    [Test]
    public async Task GivenAnEmptyWorkbookAndPropertyLimits_ShouldReturnAFilledWorkbook()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TestTerrorismTemplateEmpty.xlsx");
        var workbook = new Workbook(path);
        var propertyLimits = TestFixtures.GetPropertyLimits();

        // Act
        var workbookWithData = await _subject.InsertPropertyLimitsIntoWorkbook(
            workbook,
            propertyLimits,
            new PropertyLimitFloatingValues(),
            null,
            WordingVersionId);

        //// Assert
        workbookWithData.Should().NotBeNull();
        _mockAsposeRowInserter.Received(3).InsertRows(workbook, Arg.Any<List<ExtractedRow>>(),
            Arg.Any<ExtractorColumnConfiguration>(), Arg.Any<int>());

        var receivedCalls = _mockAsposeRowInserter.ReceivedCalls().First();
        var rowsToInsert = receivedCalls.GetArguments()[1] as List<ExtractedRow>;
        rowsToInsert.Should().NotBeNull();
        rowsToInsert.Should().NotBeEmpty();
        rowsToInsert.Count.Should().Be(3);
        rowsToInsert[0].CellValues.Count.Should().Be(16);
        rowsToInsert[0].CellValues[0].StringValue.Should().Be(_propertyLimits[0].InsuredAddress.Country.Name);
        rowsToInsert[0].CellValues[1].StringValue.Should().Be(_propertyLimits[0].InsuredAddress.Address1);
        rowsToInsert[0].CellValues[2].StringValue.Should().Be(_propertyLimits[0].InsuredAddress.Address2);
        rowsToInsert[0].CellValues[3].StringValue.Should().Be(_propertyLimits[0].InsuredAddress.City);
        rowsToInsert[0].CellValues[4].StringValue.Should().Be("District of Columbia");
        rowsToInsert[0].CellValues[5].StringValue.Should().Be(_propertyLimits[0].InsuredAddress.County);
        rowsToInsert[0].CellValues[6].StringValue.Should().Be(_propertyLimits[0].InsuredAddress.Postcode);
        rowsToInsert[0].CellValues[7].DoubleValue.Should().Be(_propertyLimits[0].InsuredAddress.Latitude);
        rowsToInsert[0].CellValues[8].DoubleValue.Should().Be(_propertyLimits[0].InsuredAddress.Longitude);
        rowsToInsert[0].CellValues[9].StringValue.Should().Be(_propertyLimits[0].InsuredAddress.ClientLocationProperties.First().Value);
        rowsToInsert[0].CellValues[10].IntegerValue.Should().Be(_propertyLimits[0].PropertyDamageLimit);
        rowsToInsert[0].CellValues[11].IntegerValue.Should().Be(_propertyLimits[0].ContentsDamageLimit);
        rowsToInsert[0].CellValues[12].IntegerValue.Should().Be(_propertyLimits[0].ActualLossSustainedLimit);
        rowsToInsert[0].CellValues[13].IntegerValue.Should().Be(_propertyLimits[0].IncreasedCostOfWorkingLimit);
        rowsToInsert[0].CellValues[14].IntegerValue.Should().Be(_propertyLimits[0].LossOfRentLimit);
        rowsToInsert[0].CellValues[15].IntegerValue.Should().Be(_propertyLimits[0].AlternativeAccommodationLimit);
    }

    [Test]
    public async Task GivenAnEmptyWorkbookAndPropertyLimits_WhenOverriddenCoordinatesExist_ShouldUseOverriddenCoordinates()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TestTerrorismTemplateEmpty.xlsx");
        var workbook = new Workbook(path);
        
        var propertyLimits = new List<WebApiDto.Dto.PropertyLimit>
        {
            new()
            {
                PropertyDamageLimit = 20000,
                ContentsDamageLimit = 60000,
                ActualLossSustainedLimit = 1000,
                LossOfRentLimit = 5000,
                IncreasedCostOfWorkingLimit = 3000,
                AlternativeAccommodationLimit = 6000,
                InsuredAddress = new Models.ClientLocation()
                {
                    CountryId = 4,
                    Address1 = "1600 Pennsylvania Avenue",
                    Address2 = "Northwest",
                    City = "Washington",
                    Postcode = "37188",
                    StateProvinceCode = "DC",
                    Latitude = 38.897778,  // Google API coordinates
                    Longitude = -77.036389,
                    OverriddenLatitude = 38.999999,  // User-provided coordinates (different)
                    OverriddenLongitude = -77.999999,
                    Country = new Country() { CountryId = 4, Name = "US", IsoCode = "US" },
                    County = "",
                    ClientLocationProperties = new List<Models.ClientLocationProperties>
                    {
                        new() { Tag = "BuildingUse", Value = "COMMERCIAL" }
                    }
                }
            }
        };

        // Act
        var workbookWithData = await _subject.InsertPropertyLimitsIntoWorkbook(
            workbook,
            propertyLimits,
            new PropertyLimitFloatingValues(),
            null,
            WordingVersionId);

        // Assert - Should use overridden coordinates in the spreadsheet
        var receivedCalls = _mockAsposeRowInserter.ReceivedCalls().First();
        var rowsToInsert = receivedCalls.GetArguments()[1] as List<ExtractedRow>;
        rowsToInsert.Should().NotBeNull();
        rowsToInsert[0].CellValues[7].DoubleValue.Should().Be(38.999999);  // Overridden latitude
        rowsToInsert[0].CellValues[8].DoubleValue.Should().Be(-77.999999); // Overridden longitude
    }

    [Test]
    public async Task GivenAnEmptyWorkbookAndPropertyLimits_WhenNoOverriddenCoordinates_ShouldUseGoogleApiCoordinates()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TestTerrorismTemplateEmpty.xlsx");
        var workbook = new Workbook(path);
        
        var propertyLimits = new List<WebApiDto.Dto.PropertyLimit>
        {
            new()
            {
                PropertyDamageLimit = 20000,
                ContentsDamageLimit = 60000,
                ActualLossSustainedLimit = 1000,
                LossOfRentLimit = 5000,
                IncreasedCostOfWorkingLimit = 3000,
                AlternativeAccommodationLimit = 6000,
                InsuredAddress = new Models.ClientLocation()
                {
                    CountryId = 4,
                    Address1 = "1600 Pennsylvania Avenue",
                    Address2 = "Northwest",
                    City = "Washington",
                    Postcode = "37188",
                    StateProvinceCode = "DC",
                    Latitude = 38.897778,  // Google API coordinates
                    Longitude = -77.036389,
                    OverriddenLatitude = null,  // No overridden coordinates
                    OverriddenLongitude = null,
                    Country = new Country() { CountryId = 4, Name = "US", IsoCode = "US" },
                    County = "",
                    ClientLocationProperties = new List<Models.ClientLocationProperties>
                    {
                        new() { Tag = "BuildingUse", Value = "COMMERCIAL" }
                    }
                }
            }
        };

        // Act
        var workbookWithData = await _subject.InsertPropertyLimitsIntoWorkbook(
            workbook,
            propertyLimits,
            new PropertyLimitFloatingValues(),
            null,
            WordingVersionId);

        // Assert - Should use Google API coordinates in the spreadsheet
        var receivedCalls = _mockAsposeRowInserter.ReceivedCalls().First();
        var rowsToInsert = receivedCalls.GetArguments()[1] as List<ExtractedRow>;
        rowsToInsert.Should().NotBeNull();
        rowsToInsert[0].CellValues[7].DoubleValue.Should().Be(38.897778);  // Google API latitude
        rowsToInsert[0].CellValues[8].DoubleValue.Should().Be(-77.036389); // Google API longitude
    }

    [Test]
    public async Task GivenAWorkbook_WhenIGetPropertyLimits_ThenTheGeolocationServiceIsCalledForEachClientLocation()
    {
        // Arrange
        SetUpMockAsposeRowExtractor(TestFixtures.StubListOfExtractedRows(), new List<ExtractedRow>());

        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(new GeolocationResult());

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockGeolocationService.Received(3).GetAsync(Arg.Any<string>());
    }

    [Test]
    public async Task GivenAWorkbook_WhenIGetPropertyLimitsWithNoGeolocation_ThenInsuredAddressesAreGeolocated()
    {
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        const string fullAddress = "87 Gracechurch St, Central, London, London, EC3V 0AA, UK";

        // Arrange
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());


        _mockGeolocationService.GetAsync(fullAddress).Returns(new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            QueriedAddress = fullAddress,
            Precision = "ROOFTOP",
            FormattedAddress = "87 Gracechurch St, London, EC3V 0AA, UK",
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockGeolocationService.Received(1).GetAsync(fullAddress);
        result.PropertyLimits[2].InsuredAddress.Latitude.Should().Be(51.5074);
        result.PropertyLimits[2].InsuredAddress.Longitude.Should().Be(0.1278);
        result.PropertyLimits[2].InsuredAddress.Precision.Should().Be("ROOFTOP");
        result.PropertyLimits[2].InsuredAddress.ClientLocationProperties.Where(x=>x.Tag == "FormattedAddress").FirstOrDefault().Value.Should().Be("87 Gracechurch St, London, EC3V 0AA, UK");
    }

    [Test]
    public async Task GivenAWorkbook_AndPropertyLimitHasALatLngPopulated_WhenIGetPropertyLimits_ThenInsuredAddressesAreNotGeolocated()
    {
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        const string fullAddress = "85 Gracechurch St, Central, London, London, EC3V 0AA, UK";

        // Arrange
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        _mockGeolocationService.GetAsync(fullAddress).Returns(new GeolocationResult
        {
            Success = false,
            Latitude = 51.5074,
            Longitude = 0.1278,
            QueriedAddress = fullAddress,
            Precision = "ROOFTOP",
            ErrorMessage = null
        });
        _mockGeolocationService.GetAsync("87 Gracechurch St, Central, London, London, EC3V 0AA, UK").Returns(new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            QueriedAddress = "87 Gracechurch St, Central, London, London, EC3V 0AA, UK",
            Precision = "APPROXIMATE",
            ErrorMessage = null
        });
        _mockGeolocationService.GetAsync("1600 Pennsylvania Avenue, Northwest, Washington, DC, 37188, US").Returns(new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            QueriedAddress = "1600 Pennsylvania Avenue, Northwest, Washington, DC, 37188, US",
            Precision = "ROOFTOP",
            ErrorMessage = null
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockGeolocationService.Received(1).GetAsync(fullAddress);
        result.ValidationResults.Count.Should().Be(1);
        result.ValidationResults.First()
            .Errors.First()
            .ErrorMessage
            .Should()
            .Be("Geolocated Zone A address returned does not provide rooftop-level precision");
    }

    [Test]
    public async Task GivenAWorkbook_WhenIGetErrorsOnGeolocation_ThenValidationResultAddedWithGeolocateErrors()
    {
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        const string fullAddress = "85 Gracechurch St, Central, London, London, EC3V 0AA, UK";
        var approximateLocation = "87 Gracechurch St, Central, London, London, EC3V 0AA, UK";

        // Arrange
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        var geolocationResult = new GeolocationResult
        {
            Success = false,
            ErrorMessage = "Geolocated Zone A address returned does not provide rooftop-level precision",
        };
        _mockGeolocationService.GetAsync(fullAddress).Returns(geolocationResult);
        _mockGeolocationService.GetAsync(approximateLocation).Returns(new GeolocationResult()
        {
            Success = true,
            ErrorMessage = null,
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockGeolocationService.Received(1).GetAsync(fullAddress);
        result.ValidationResults.Should().NotBeNull();
        result.ValidationResults.Count.Should().Be(1);
        result.ValidationResults[0].Errors[0].ToString().Should().Be(geolocationResult.ErrorMessage);
    }

    [Test]
    public async Task GivenAWorkbook_WhenGeolocationIsNotSuccessful_ThenSkipsLocation()
    {
        var extractedRows = TestFixtures.StubListOfExtractedRows();

        // Arrange
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockGeolocationService.Received(3).GetAsync(Arg.Any<string>());
        result.PropertyLimits[2].InsuredAddress.Latitude.Should().BeNull();
        result.PropertyLimits[2].InsuredAddress.Longitude.Should().BeNull();
    }

    [Test]
    public async Task GivenAWorkbook_ThenLocationsApiShouldReturnClientLocations()
    {
        // Arrange
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        // Act
        await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockLocationApi.Received(1).GetAsync(_clientId);
    }

    [Test]
    public async Task GivenAWorkbook_ThenCountryApiShouldReturnCountries()
    {
        // Arrange
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        // Act
        await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockCountryApi.Received(1).GetAsync();
    }

    [Test]
    public async Task GivenAWorkbook_WhenClientLocationIsMatchedWithSpreadsheet_ThenReturnPropertyLimitWithCorrectClientLocationId()
    {
        // Arrange
        const string fullAddress = "85 Gracechurch St, Central, London, London, EC3V 0AA, UK";
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        _mockLocationApi.GetAsync(Arg.Any<int>()).Returns(new List<ClientLocation>
        {
            new ClientLocation
            {
                Address1 = "85 Gracechurch St",
                Address2 = "Central",
                City = "London",
                County = "London",
                Postcode = "EC3V 0AA",
                ClientLocationId = 10,
                CountryId = 1
            }
        });
        _mockGeolocationService.GetAsync(fullAddress).Returns(new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            QueriedAddress = fullAddress,
            FormattedAddress = "85 Gracechurch St, London, EC3V 0AA, UK",
            Precision = "ROOFTOP"
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.PropertyLimits[1].InsuredAddress.ClientLocationId.Should().Be(10);
        await _mockGeolocationService.Received(4).GetAsync(Arg.Any<string>());
    }


    [Test]
    public async Task GivenAWorkbook_WhenClientLocationsAreReturned_ThenOnlyLatestDistinctClientLocationWillBeGeolocated()
    {
        // Arrange
        const string fullAddress = "85 Gracechurch St, Central, London, London, EC3V 0AA, UK";
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());
        _mockLocationApi.GetAsync(Arg.Any<int>()).Returns(new List<ClientLocation>
        {
            new ClientLocation
            {
                Address1 = "85 Gracechurch St",
                Address2 = "Central",
                City = "London",
                County = "London",
                Postcode = "EC3V 0AA",
                ClientLocationId = 10,
                CountryId = 1
            },
            new ClientLocation
            {
                Address1 = "85 Gracechurch St",
                Address2 = "Central",
                City = "London",
                County = "London",
                Postcode = "EC3V 0AA",
                ClientLocationId = 11,
                CountryId = 1
            },
            new ClientLocation
            {
                Address1 = "85 Gracechurch St",
                Address2 = "Central",
                City = "London",
                County = "London",
                Postcode = "EC3V 0AA",
                ClientLocationId = 12,
                CountryId = 1
            }
        });
        _mockGeolocationService.GetAsync(fullAddress).Returns(new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            QueriedAddress = fullAddress,
            FormattedAddress = "85 Gracechurch St, London, EC3V 0AA, UK"
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.PropertyLimits[1].InsuredAddress.ClientLocationId.Should().Be(12);
        await _mockGeolocationService.Received(4).GetAsync(Arg.Any<string>());
    }

    [Test]
    public async Task GivenAWorkbook_WhenClientLocationCallReturnsNoResults_ThenItShouldNotTryToGeoLocateClientLocation()
    {
        // Arrange
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        _mockLocationApi.GetAsync(Arg.Any<int>()).Returns(new List<ClientLocation>());

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockGeolocationService.Received(3).GetAsync(Arg.Any<string>());
    }

    [Test]
    public async Task GivenAWorkbook_WhenExistingClientLocationHasNoLatitudeLongitude_ThenItGetsPopulatedFromGoogleApi()
    {
        // Given a Property Limit location is matched with an existing client location formatted address
        var spreadsheetRow = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(spreadsheetRow, new List<ExtractedRow>());

        const int clientLocationId = 123;

        var clientLocations = new List<ClientLocation>()
        {
            new Models.ClientLocation()
            {
                ClientId = _clientId,
                ClientLocationId = clientLocationId,
                Address1 = "1600 Pennsylvania Avenue",
                Address2 = "Northwest",
                City = "Washington",
                StateProvinceCode = "DC",
                County = "",
                Postcode = "37188",
                ClientLocationProperties = new List<ClientLocationProperties>()
                {
                    new Models.ClientLocationProperties(){ Tag = "BuildingUse", Value = "COMMERCIAL"}
                },
                Country = new Country(){ IsoCode = "US", Name = "US", CountryId = 4},
                CountryId = 4,
            }
        };

        var countryNames = new Dictionary<int, string>()
        {
            {1,"UK"},
            {4,"US"},
        };
        var fullAddress = clientLocations.FirstOrDefault().ToFullAddress(countryNames);

        _mockGeolocationService.GetAsync(fullAddress).Returns(new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            QueriedAddress = fullAddress,
            FormattedAddress = fullAddress
        });
        _mockLocationApi.GetAsync(Arg.Any<int>()).Returns(clientLocations);

        // And the existing client location latitude and longitude are empty

        // When
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);
        // Then it should return the existing matched client location details with the latitude and longitude populated
        // NEW LOGIC: Google API results (51.5074, 0.1278) go to Latitude/Longitude
        // Spreadsheet values (38.897778, -77.036389) go to OverriddenLatitude/OverriddenLongitude
        result.PropertyLimits.FirstOrDefault().InsuredAddress.ClientLocationId.Should().Be(clientLocationId);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.Latitude.Should().Be(51.5074);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.Longitude.Should().Be(0.1278);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.OverriddenLatitude.Should().Be(38.897778);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.OverriddenLongitude.Should().Be(-77.036389);
    }

    [Test]
    public async Task GivenAWorkbook_WhenClientLocationIsMatchedWithSpreadsheet_ThenReturnPropertyLimitWithCorrectLocationInformation()
    {
        // Arrange
        const string fullAddress = "85 Gracechurch St, Central, London, London, EC3V 0AA, UK";
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        _mockLocationApi.GetAsync(Arg.Any<int>()).Returns(new List<ClientLocation>
        {
            new ClientLocation
            {
                Address1 = "85 Gracechurch St",
                Address2 = "Central",
                City = "London",
                County = "London",
                Postcode = "EC3V 0AA",
                ClientLocationId = 10,
                CountryId = 1
            }
        });
        _mockGeolocationService.GetAsync(fullAddress).Returns(new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            QueriedAddress = fullAddress,
            FormattedAddress = "85 Gracechurch St, London, EC3V 0AA, UK"
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.PropertyLimits[1].InsuredAddress.County.Should().Be("London");
        result.PropertyLimits[1].InsuredAddress.Postcode.Should().Be("EC3V 0AA");
        result.PropertyLimits[1].InsuredAddress.CountryId.Should().Be(1);
        result.PropertyLimits[1].InsuredAddress.Address1.Should().Be("85 Gracechurch St");
        await _mockGeolocationService.Received(4).GetAsync(Arg.Any<string>());
    }

    [Test]
    public async Task GivenAWorkBookWithNoFloatingAndALocationWithNoTIV_WhenIGetPropertyLimits_ThenIGetNoCoverForLocationValidationError()
    {
        // Arrange
        var extractedRows = TestFixtures.StubListOfExtractedRowsForTemplate_WithOneLocationWithNoTIV();
        _mockAsposeRowExtractor.ExtractRows(_workbook, Arg.Any<ExtractorColumnConfiguration>(), 0, Arg.Any<bool>())
             .Returns(extractedRows);

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.PropertyLimits.Count.Should().Be(1);
        result.ValidationResults.Count.Should().Be(1);
        result.ValidationResults.First().Errors.Count.Should().Be(1);
        result.ValidationResults.First().Errors.First().ErrorMessage.Should().Be("No cover has been provided for this location");
    }

    [Test]
    public async Task GivenAWorkbook_WhenExistingClientLocationHasMatchingLatitudeLongitude_ThenItIsMatchedAndOverriddenFieldsArePopulated()
    {
        // Given a Property Limit location is matched with an existing client location formatted address
        // Arrange
        var spreadsheetRow = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(spreadsheetRow, new List<ExtractedRow>());

        const int clientLocationId = 123;

        var latitude = 38.897778;
        var longitude = -77.036389;

        var clientLocations = new List<ClientLocation>()
        {
            new Models.ClientLocation()
            {
                ClientId = _clientId,
                ClientLocationId = clientLocationId,
                Address1 = "1600 Pennsylvania Avenue",
                Address2 = "Northwest",
                City = "Washington",
                StateProvinceCode = "DC",
                County = "",
                Postcode = "37188",
                Latitude = latitude,
                Longitude = longitude,
                ClientLocationProperties = new List<ClientLocationProperties>()
                {
                    new Models.ClientLocationProperties(){ Tag = "BuildingUse", Value = "COMMERCIAL"}
                },
                Country = new Country(){ IsoCode = "US", Name = "US", CountryId = 4},
                CountryId = 4,
            }
        };

        var countryNames = new Dictionary<int, string>()
        {
            {1,"UK"},
            {4,"US"},
        };
        var fullAddress = clientLocations.FirstOrDefault().ToFullAddress(countryNames);

        // NEW LOGIC: Google API returns same coordinates as existing (since address hasn't changed)
        // This allows the match to succeed (IsGeolocationConflict returns false)
        var googleApiLatitude = latitude;   // Must be EXACTLY the same for match to work
        var googleApiLongitude = longitude;
        
        // Setup specific mock for the matched address
        _mockGeolocationService.GetAsync(fullAddress).Returns(new GeolocationResult
        {
            Success = true,
            Latitude = googleApiLatitude,
            Longitude = googleApiLongitude,
            Precision = "ROOFTOP",
            QueriedAddress = fullAddress,
            FormattedAddress = fullAddress
        });
        
        // Setup default response for other addresses (from other rows in the spreadsheet)
        _mockGeolocationService.GetAsync(Arg.Is<string>(s => s != fullAddress)).Returns(callInfo => new GeolocationResult
        {
            Success = true,
            Latitude = 51.5,
            Longitude = -0.1,
            Precision = "ROOFTOP",
            QueriedAddress = callInfo.Arg<string>(),
            FormattedAddress = callInfo.Arg<string>()
        });
        
        _mockLocationApi.GetAsync(Arg.Any<int>()).Returns(clientLocations);

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        // NEW LOGIC: Google API results overwrite Latitude/Longitude
        // Since spreadsheet values match Google API values, OverriddenLatitude/OverriddenLongitude should be NULL
        result.PropertyLimits.FirstOrDefault().InsuredAddress.ClientLocationId.Should().Be(clientLocationId);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.Postcode.Should().Be("37188");
        result.PropertyLimits.FirstOrDefault().InsuredAddress.StateProvinceCode.Should().Be("DC");
        result.PropertyLimits.FirstOrDefault().InsuredAddress.CountryId.Should().Be(4);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.City.Should().Be("Washington");
        result.PropertyLimits.FirstOrDefault().InsuredAddress.Latitude.Should().Be(googleApiLatitude);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.Longitude.Should().Be(googleApiLongitude);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.Precision.Should().Be("ROOFTOP");
        result.PropertyLimits.FirstOrDefault().InsuredAddress.OverriddenLatitude.Should().BeNull();
        result.PropertyLimits.FirstOrDefault().InsuredAddress.OverriddenLongitude.Should().BeNull();
        result.PropertyLimits.FirstOrDefault().InsuredAddress.ClientLocationProperties.Where(x => x.Tag == "FormattedAddress").FirstOrDefault().Value.Should().Be(fullAddress);
    }


    [Test]
    public async Task GivenAWorkbook_WhenExistingClientLocationHasDifferentLatitudeLongitude_ThenNoMatchOccursAndNewLocationIsCreated()
    {
        var spreadsheetRow = TestFixtures.GetExtractedRowsWithNullGeolocationData();
        SetUpMockAsposeRowExtractor(spreadsheetRow, new List<ExtractedRow>());

        const int clientLocationId = 123;

        var clientLocations = new List<ClientLocation>()
        {
            new Models.ClientLocation()
            {
                ClientId = _clientId,
                ClientLocationId = clientLocationId,
                Address1 = "1600 Pennsylvania Avenue",
                Address2 = "Northwest",
                City = "Washington",
                StateProvinceCode = "DC",
                County = "",
                Postcode = "37188",
                Latitude = 0.666,
                Longitude = 42,
                ClientLocationProperties = new List<ClientLocationProperties>()
                {
                    new Models.ClientLocationProperties(){ Tag = "BuildingUse", Value = "COMMERCIAL"}
                },
                Country = new Country(){ IsoCode = "US", Name = "US", CountryId = 4},
                CountryId = 4,
            }
        };

        var countryNames = new Dictionary<int, string>()
        {
            {1,"UK"},
            {4,"US"},
        };
        var fullAddress = clientLocations.FirstOrDefault().ToFullAddress(countryNames);

        _mockGeolocationService.GetAsync(fullAddress).Returns(new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            QueriedAddress = fullAddress,
            Precision = "APPROXIMATE",
            FormattedAddress = fullAddress
        });
        _mockLocationApi.GetAsync(Arg.Any<int>()).Returns(clientLocations);

        // And the existing client location latitude and longitude are empty

        // When
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);
        // Then it should return the existing matched client location details with the latitude and longitude populated
        result.PropertyLimits.FirstOrDefault().InsuredAddress.ClientLocationId.Should().Be(0);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.Latitude.Should().Be(51.5074);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.Longitude.Should().Be(0.1278);
        result.PropertyLimits.FirstOrDefault().InsuredAddress.Precision.Should().Be("APPROXIMATE");
        result.PropertyLimits.FirstOrDefault().InsuredAddress.ClientLocationProperties.Where(x => x.Tag == "FormattedAddress").FirstOrDefault().Value.Should().Be(fullAddress);
    }



    [Test]
    public async Task GivenAWorkbook_WhenSpreadsheetHasLatitudeLongitude_ThenOverriddenLatitudeLongitudeArePopulated()
    {
        // Arrange
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            Precision = "ROOFTOP",
            FormattedAddress = "Some formatted address"
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert - First row has lat/long in spreadsheet (38.897778, -77.036389)
        result.PropertyLimits[0].InsuredAddress.OverriddenLatitude.Should().Be(38.897778);
        result.PropertyLimits[0].InsuredAddress.OverriddenLongitude.Should().Be(-77.036389);
        
        // Second row has lat/long in spreadsheet (51.1, -3.4)
        result.PropertyLimits[1].InsuredAddress.OverriddenLatitude.Should().Be(51.1);
        result.PropertyLimits[1].InsuredAddress.OverriddenLongitude.Should().Be(-3.4);
        
        // Third row has no lat/long in spreadsheet
        result.PropertyLimits[2].InsuredAddress.OverriddenLatitude.Should().BeNull();
        result.PropertyLimits[2].InsuredAddress.OverriddenLongitude.Should().BeNull();
    }

    [Test]
    public async Task GivenAWorkbook_WhenSpreadsheetHasLatitudeLongitude_ThenGoogleApiLatitudeLongitudeAreStillPopulated()
    {
        // Arrange
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        // Return different lat/long for each call to distinguish from spreadsheet values
        var callCount = 0;
        var googleApiResults = new[]
        {
            new GeolocationResult { Success = true, Latitude = 38.8977, Longitude = -77.0365, Precision = "ROOFTOP" },
            new GeolocationResult { Success = true, Latitude = 51.5119, Longitude = -0.0837, Precision = "ROOFTOP" },
            new GeolocationResult { Success = true, Latitude = 51.5130, Longitude = -0.0838, Precision = "ROOFTOP" }
        };

        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(callInfo =>
        {
            var result = googleApiResults[callCount];
            result.QueriedAddress = callInfo.Arg<string>();
            result.FormattedAddress = callInfo.Arg<string>();
            callCount++;
            return result;
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert - All rows should have Google API results in Latitude/Longitude (different from spreadsheet values)
        result.PropertyLimits[0].InsuredAddress.Latitude.Should().Be(38.8977);
        result.PropertyLimits[0].InsuredAddress.Longitude.Should().Be(-77.0365);
        result.PropertyLimits[0].InsuredAddress.Precision.Should().Be("ROOFTOP");

        result.PropertyLimits[1].InsuredAddress.Latitude.Should().Be(51.5119);
        result.PropertyLimits[1].InsuredAddress.Longitude.Should().Be(-0.0837);
        result.PropertyLimits[1].InsuredAddress.Precision.Should().Be("ROOFTOP");

        result.PropertyLimits[2].InsuredAddress.Latitude.Should().Be(51.5130);
        result.PropertyLimits[2].InsuredAddress.Longitude.Should().Be(-0.0838);
        result.PropertyLimits[2].InsuredAddress.Precision.Should().Be("ROOFTOP");
    }

    [Test]
    public async Task GivenAWorkbook_WhenSpreadsheetHasLatitudeLongitudeAndGoogleApiFails_ThenOverriddenFieldsArePopulatedButRegularFieldsAreNull()
    {
        // Arrange
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(new GeolocationResult
        {
            Success = false,
            ErrorMessage = "Address not found"
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert - First row has spreadsheet values in Overridden fields but null in regular fields
        result.PropertyLimits[0].InsuredAddress.OverriddenLatitude.Should().Be(38.897778);
        result.PropertyLimits[0].InsuredAddress.OverriddenLongitude.Should().Be(-77.036389);
        result.PropertyLimits[0].InsuredAddress.Latitude.Should().BeNull();
        result.PropertyLimits[0].InsuredAddress.Longitude.Should().BeNull();
        result.PropertyLimits[0].InsuredAddress.Precision.Should().BeNull();
    }

    [Test]
    public async Task GivenAWorkbook_WhenSpreadsheetHasNoLatitudeLongitudeAndGoogleApiSucceeds_ThenOnlyRegularFieldsArePopulated()
    {
        // Arrange - Create extracted row with no lat/long to avoid the issue with StubListOfExtractedRows which has mixed data
        var extractedRow = new ExtractedRow
        {
            RowNumber = 1,
            CellValues = new List<ExtractedCellValue>
            {
                new() { ColumnName = TemplateConfiguration.Country, ColumnIndex = 0, StringValue = "UK" },
                new() { ColumnName = TemplateConfiguration.AddressLine1, ColumnIndex = 1, StringValue = "87 Gracechurch St" },
                new() { ColumnName = TemplateConfiguration.AddressLine2, ColumnIndex = 2, StringValue = "Central" },
                new() { ColumnName = TemplateConfiguration.TownOrCity, ColumnIndex = 3, StringValue = "London" },
                new() { ColumnName = TemplateConfiguration.StateOrProvince, ColumnIndex = 4, StringValue = "" },
                new() { ColumnName = TemplateConfiguration.County, ColumnIndex = 5, StringValue = "London" },
                new() { ColumnName = TemplateConfiguration.PostCode, ColumnIndex = 6, StringValue = "EC3V 0AA" },
                new() { ColumnName = TemplateConfiguration.Latitude, ColumnIndex = 7, DoubleValue = null },
                new() { ColumnName = TemplateConfiguration.Longitude, ColumnIndex = 8, DoubleValue = null },
                new() { ColumnName = TemplateConfiguration.BuildingUse, ColumnIndex = 9, StringValue = "RESIDENTIAL" },
                new() { ColumnName = TemplateConfiguration.PropertyDamageLimit, ColumnIndex = 10, IntegerValue = 30000 },
                new() { ColumnName = TemplateConfiguration.ContentsDamageLimit, ColumnIndex = 11, IntegerValue = 40000 },
                new() { ColumnName = TemplateConfiguration.ActualLossSustainedLimit, ColumnIndex = 12, IntegerValue = 1100 },
                new() { ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit, ColumnIndex = 13, IntegerValue = 3100 },
                new() { ColumnName = TemplateConfiguration.LossOfRentLimit, ColumnIndex = 14, IntegerValue = 5100 },
                new() { ColumnName = TemplateConfiguration.AlternativeAccommodationLimit, ColumnIndex = 15, IntegerValue = 6100 }
            }
        };
        
        SetUpMockAsposeRowExtractor(new List<ExtractedRow> { extractedRow }, new List<ExtractedRow>());

        // Mock needs to return QueriedAddress that matches the input to work with the orchestrator logic
        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(callInfo => new GeolocationResult
        {
            Success = true,
            Latitude = 51.5130,
            Longitude = -0.0838,
            Precision = "ROOFTOP",
            QueriedAddress = callInfo.Arg<string>(),
            FormattedAddress = "87 Gracechurch St, London, EC3V 0AA, UK"
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert - Only regular fields populated, Overridden fields are null
        result.PropertyLimits[0].InsuredAddress.Latitude.Should().Be(51.5130);
        result.PropertyLimits[0].InsuredAddress.Longitude.Should().Be(-0.0838);
        result.PropertyLimits[0].InsuredAddress.Precision.Should().Be("ROOFTOP");
        result.PropertyLimits[0].InsuredAddress.OverriddenLatitude.Should().BeNull();
        result.PropertyLimits[0].InsuredAddress.OverriddenLongitude.Should().BeNull();
    }

    [Test]
    public async Task GivenAWorkbook_WhenSpreadsheetHasLatitudeLongitude_ThenGeolocationServiceIsStillCalled()
    {
        // Arrange
        var extractedRows = TestFixtures.StubListOfExtractedRows();
        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            Precision = "ROOFTOP",
            FormattedAddress = "Some address"
        });

        // Act
        await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert - Geolocation service should be called for all 3 addresses, even those with spreadsheet lat/long
        await _mockGeolocationService.Received(3).GetAsync(Arg.Any<string>());
    }

    [Test]
    public async Task GivenAWorkbook_WhenZoneAAddressHasSpreadsheetLatLongAndGoogleApiReturnsApproximate_ThenNoValidationErrorOccurs()
    {
        // Arrange - Create a UK Zone A address (EC3V) with spreadsheet lat/long
        var extractedRow = new ExtractedRow
        {
            RowNumber = 1,
            CellValues = new List<ExtractedCellValue>
            {
                new() { ColumnName = TemplateConfiguration.Country, ColumnIndex = 0, StringValue = "UK" },
                new() { ColumnName = TemplateConfiguration.AddressLine1, ColumnIndex = 1, StringValue = "85 Gracechurch St" },
                new() { ColumnName = TemplateConfiguration.AddressLine2, ColumnIndex = 2, StringValue = "Central" },
                new() { ColumnName = TemplateConfiguration.TownOrCity, ColumnIndex = 3, StringValue = "London" },
                new() { ColumnName = TemplateConfiguration.StateOrProvince, ColumnIndex = 4, StringValue = "" },
                new() { ColumnName = TemplateConfiguration.County, ColumnIndex = 5, StringValue = "London" },
                new() { ColumnName = TemplateConfiguration.PostCode, ColumnIndex = 6, StringValue = "EC3V 0AA" }, // Zone A postcode
                new() { ColumnName = TemplateConfiguration.Latitude, ColumnIndex = 7, DoubleValue = 51.5119 }, // Spreadsheet has lat/long
                new() { ColumnName = TemplateConfiguration.Longitude, ColumnIndex = 8, DoubleValue = -0.0837 },
                new() { ColumnName = TemplateConfiguration.BuildingUse, ColumnIndex = 9, StringValue = "COMMERCIAL" },
                new() { ColumnName = TemplateConfiguration.PropertyDamageLimit, ColumnIndex = 10, IntegerValue = 100000 },
                new() { ColumnName = TemplateConfiguration.ContentsDamageLimit, ColumnIndex = 11, IntegerValue = 50000 },
                new() { ColumnName = TemplateConfiguration.ActualLossSustainedLimit, ColumnIndex = 12, IntegerValue = 10000 },
                new() { ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit, ColumnIndex = 13, IntegerValue = 5000 },
                new() { ColumnName = TemplateConfiguration.LossOfRentLimit, ColumnIndex = 14, IntegerValue = 5000 },
                new() { ColumnName = TemplateConfiguration.AlternativeAccommodationLimit, ColumnIndex = 15, IntegerValue = 5000 }
            }
        };

        SetUpMockAsposeRowExtractor(new List<ExtractedRow> { extractedRow }, new List<ExtractedRow>());

        // Google API returns APPROXIMATE precision (not ROOFTOP)
        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(callInfo => new GeolocationResult
        {
            Success = true,
            Latitude = 51.5120,  // Different from spreadsheet to verify Google API values are used
            Longitude = -0.0838,
            Precision = "APPROXIMATE", // NOT ROOFTOP - would normally fail Zone A validation
            QueriedAddress = callInfo.Arg<string>(),
            FormattedAddress = callInfo.Arg<string>()
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert - NO validation errors because spreadsheet supplied lat/long bypasses Zone A validation
        result.ValidationResults.Should().BeEmpty();
        
        // Verify spreadsheet values are in Overridden fields
        result.PropertyLimits[0].InsuredAddress.OverriddenLatitude.Should().Be(51.5119);
        result.PropertyLimits[0].InsuredAddress.OverriddenLongitude.Should().Be(-0.0837);
        
        // Verify Google API values are in regular fields
        result.PropertyLimits[0].InsuredAddress.Latitude.Should().Be(51.5120);
        result.PropertyLimits[0].InsuredAddress.Longitude.Should().Be(-0.0838);
        result.PropertyLimits[0].InsuredAddress.Precision.Should().Be("APPROXIMATE");
    }

    [Test]
    public async Task GivenAWorkbook_WhenSpreadsheetLatLongMatchesGoogleApiLatLong_ThenOverriddenFieldsAreCleared()
    {
        // Arrange - Create extracted row with lat/long that will match Google API result
        var extractedRow = new ExtractedRow
        {
            RowNumber = 1,
            CellValues = new List<ExtractedCellValue>
            {
                new() { ColumnName = TemplateConfiguration.Country, ColumnIndex = 0, StringValue = "UK" },
                new() { ColumnName = TemplateConfiguration.AddressLine1, ColumnIndex = 1, StringValue = "87 Gracechurch St" },
                new() { ColumnName = TemplateConfiguration.AddressLine2, ColumnIndex = 2, StringValue = "Central" },
                new() { ColumnName = TemplateConfiguration.TownOrCity, ColumnIndex = 3, StringValue = "London" },
                new() { ColumnName = TemplateConfiguration.StateOrProvince, ColumnIndex = 4, StringValue = "" },
                new() { ColumnName = TemplateConfiguration.County, ColumnIndex = 5, StringValue = "London" },
                new() { ColumnName = TemplateConfiguration.PostCode, ColumnIndex = 6, StringValue = "EC3V 0AA" },
                new() { ColumnName = TemplateConfiguration.Latitude, ColumnIndex = 7, DoubleValue = 51.5074 }, // SAME as Google API
                new() { ColumnName = TemplateConfiguration.Longitude, ColumnIndex = 8, DoubleValue = 0.1278 }, // SAME as Google API
                new() { ColumnName = TemplateConfiguration.BuildingUse, ColumnIndex = 9, StringValue = "COMMERCIAL" },
                new() { ColumnName = TemplateConfiguration.PropertyDamageLimit, ColumnIndex = 10, IntegerValue = 100000 },
                new() { ColumnName = TemplateConfiguration.ContentsDamageLimit, ColumnIndex = 11, IntegerValue = 50000 },
                new() { ColumnName = TemplateConfiguration.ActualLossSustainedLimit, ColumnIndex = 12, IntegerValue = 10000 },
                new() { ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit, ColumnIndex = 13, IntegerValue = 5000 },
                new() { ColumnName = TemplateConfiguration.LossOfRentLimit, ColumnIndex = 14, IntegerValue = 5000 },
                new() { ColumnName = TemplateConfiguration.AlternativeAccommodationLimit, ColumnIndex = 15, IntegerValue = 5000 }
            }
        };

        SetUpMockAsposeRowExtractor(new List<ExtractedRow> { extractedRow }, new List<ExtractedRow>());

        // Google API returns same coordinates as spreadsheet
        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(callInfo => new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,  // SAME as spreadsheet
            Longitude = 0.1278,  // SAME as spreadsheet
            Precision = "ROOFTOP",
            QueriedAddress = callInfo.Arg<string>(),
            FormattedAddress = callInfo.Arg<string>()
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert - Overridden fields should be NULL because they match Google API values
        result.PropertyLimits[0].InsuredAddress.OverriddenLatitude.Should().BeNull();
        result.PropertyLimits[0].InsuredAddress.OverriddenLongitude.Should().BeNull();
        
        // Regular fields should have the values
        result.PropertyLimits[0].InsuredAddress.Latitude.Should().Be(51.5074);
        result.PropertyLimits[0].InsuredAddress.Longitude.Should().Be(0.1278);
        result.PropertyLimits[0].InsuredAddress.Precision.Should().Be("ROOFTOP");
    }

    [Test]
    public async Task GivenAWorkbook_WhenSpreadsheetLatLongAlmostMatchesGoogleApiWithinTolerance_ThenOverriddenFieldsAreCleared()
    {
        // Arrange - Spreadsheet values are within tolerance (< 0.00001 degrees, ~1.1m)
        var extractedRow = new ExtractedRow
        {
            RowNumber = 1,
            CellValues = new List<ExtractedCellValue>
            {
                new() { ColumnName = TemplateConfiguration.Country, ColumnIndex = 0, StringValue = "UK" },
                new() { ColumnName = TemplateConfiguration.AddressLine1, ColumnIndex = 1, StringValue = "87 Gracechurch St" },
                new() { ColumnName = TemplateConfiguration.AddressLine2, ColumnIndex = 2, StringValue = "Central" },
                new() { ColumnName = TemplateConfiguration.TownOrCity, ColumnIndex = 3, StringValue = "London" },
                new() { ColumnName = TemplateConfiguration.StateOrProvince, ColumnIndex = 4, StringValue = "" },
                new() { ColumnName = TemplateConfiguration.County, ColumnIndex = 5, StringValue = "London" },
                new() { ColumnName = TemplateConfiguration.PostCode, ColumnIndex = 6, StringValue = "EC3V 0AA" },
                new() { ColumnName = TemplateConfiguration.Latitude, ColumnIndex = 7, DoubleValue = 51.5074 },      // Spreadsheet value
                new() { ColumnName = TemplateConfiguration.Longitude, ColumnIndex = 8, DoubleValue = 0.1278 },     // Spreadsheet value
                new() { ColumnName = TemplateConfiguration.BuildingUse, ColumnIndex = 9, StringValue = "COMMERCIAL" },
                new() { ColumnName = TemplateConfiguration.PropertyDamageLimit, ColumnIndex = 10, IntegerValue = 100000 },
                new() { ColumnName = TemplateConfiguration.ContentsDamageLimit, ColumnIndex = 11, IntegerValue = 50000 },
                new() { ColumnName = TemplateConfiguration.ActualLossSustainedLimit, ColumnIndex = 12, IntegerValue = 10000 },
                new() { ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit, ColumnIndex = 13, IntegerValue = 5000 },
                new() { ColumnName = TemplateConfiguration.LossOfRentLimit, ColumnIndex = 14, IntegerValue = 5000 },
                new() { ColumnName = TemplateConfiguration.AlternativeAccommodationLimit, ColumnIndex = 15, IntegerValue = 5000 }
            }
        };

        SetUpMockAsposeRowExtractor(new List<ExtractedRow> { extractedRow }, new List<ExtractedRow>());

        // Google API returns values very slightly different (within tolerance ~0.5m)
        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(callInfo => new GeolocationResult
        {
            Success = true,
            Latitude = 51.507405,   // Differs by 0.000005 degrees (~0.55m)
            Longitude = 0.127807,   // Differs by 0.000007 degrees (~0.49m at 51° latitude)
            Precision = "ROOFTOP",
            QueriedAddress = callInfo.Arg<string>(),
            FormattedAddress = callInfo.Arg<string>()
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert - Overridden fields should be NULL because values are within tolerance
        result.PropertyLimits[0].InsuredAddress.OverriddenLatitude.Should().BeNull();
        result.PropertyLimits[0].InsuredAddress.OverriddenLongitude.Should().BeNull();
        
        // Regular fields should have Google API values
        result.PropertyLimits[0].InsuredAddress.Latitude.Should().Be(51.507405);
        result.PropertyLimits[0].InsuredAddress.Longitude.Should().Be(0.127807);
    }

    [Test]
    public async Task GivenAWorkbook_WhenSpreadsheetLatLongDiffersFromGoogleApiBeyondTolerance_ThenOverriddenFieldsAreKept()
    {
        // Arrange - Spreadsheet values differ beyond tolerance (> 0.00001 degrees, ~1.1m)
        var extractedRow = new ExtractedRow
        {
            RowNumber = 1,
            CellValues = new List<ExtractedCellValue>
            {
                new() { ColumnName = TemplateConfiguration.Country, ColumnIndex = 0, StringValue = "UK" },
                new() { ColumnName = TemplateConfiguration.AddressLine1, ColumnIndex = 1, StringValue = "87 Gracechurch St" },
                new() { ColumnName = TemplateConfiguration.AddressLine2, ColumnIndex = 2, StringValue = "Central" },
                new() { ColumnName = TemplateConfiguration.TownOrCity, ColumnIndex = 3, StringValue = "London" },
                new() { ColumnName = TemplateConfiguration.StateOrProvince, ColumnIndex = 4, StringValue = "" },
                new() { ColumnName = TemplateConfiguration.County, ColumnIndex = 5, StringValue = "London" },
                new() { ColumnName = TemplateConfiguration.PostCode, ColumnIndex = 6, StringValue = "EC3V 0AA" },
                new() { ColumnName = TemplateConfiguration.Latitude, ColumnIndex = 7, DoubleValue = 51.5074 },      // Spreadsheet value
                new() { ColumnName = TemplateConfiguration.Longitude, ColumnIndex = 8, DoubleValue = 0.1278 },     // Spreadsheet value
                new() { ColumnName = TemplateConfiguration.BuildingUse, ColumnIndex = 9, StringValue = "COMMERCIAL" },
                new() { ColumnName = TemplateConfiguration.PropertyDamageLimit, ColumnIndex = 10, IntegerValue = 100000 },
                new() { ColumnName = TemplateConfiguration.ContentsDamageLimit, ColumnIndex = 11, IntegerValue = 50000 },
                new() { ColumnName = TemplateConfiguration.ActualLossSustainedLimit, ColumnIndex = 12, IntegerValue = 10000 },
                new() { ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit, ColumnIndex = 13, IntegerValue = 5000 },
                new() { ColumnName = TemplateConfiguration.LossOfRentLimit, ColumnIndex = 14, IntegerValue = 5000 },
                new() { ColumnName = TemplateConfiguration.AlternativeAccommodationLimit, ColumnIndex = 15, IntegerValue = 5000 }
            }
        };

        SetUpMockAsposeRowExtractor(new List<ExtractedRow> { extractedRow }, new List<ExtractedRow>());

        // Google API returns values that differ meaningfully (beyond tolerance ~2.2m)
        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(callInfo => new GeolocationResult
        {
            Success = true,
            Latitude = 51.50742,   // Differs by 0.00002 degrees (~2.2m)
            Longitude = 0.12783,   // Differs by 0.00003 degrees (~2.1m at 51° latitude)
            Precision = "ROOFTOP",
            QueriedAddress = callInfo.Arg<string>(),
            FormattedAddress = callInfo.Arg<string>()
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert - Overridden fields should be KEPT because values differ beyond tolerance
        result.PropertyLimits[0].InsuredAddress.OverriddenLatitude.Should().Be(51.5074);
        result.PropertyLimits[0].InsuredAddress.OverriddenLongitude.Should().Be(0.1278);
        
        // Regular fields should have Google API values
        result.PropertyLimits[0].InsuredAddress.Latitude.Should().Be(51.50742);
        result.PropertyLimits[0].InsuredAddress.Longitude.Should().Be(0.12783);
    }

    [Test]
    public async Task GivenAWorkbook_WhenIGetPropertyLimits_ThenPriorSubmitApprovalServiceIsCalled()
    {
        // Arrange
        SetUpMockAsposeRowExtractor(TestFixtures.StubListOfExtractedRows(), new List<ExtractedRow>());

        // Act
        await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockPriorSubmitApprovalService.Received(1)
            .EvaluateLocationsAsync(Arg.Any<IList<Models.PropertyLimit>>());
    }

    [Test]
    public async Task GivenAWorkbook_WhenIGetPropertyLimits_ThenPriorSubmitApprovalServiceIsCalledWithExtractedPropertyLimits()
    {
        // Arrange
        SetUpMockAsposeRowExtractor(TestFixtures.StubListOfExtractedRows(), new List<ExtractedRow>());

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockPriorSubmitApprovalService.Received(1)
            .EvaluateLocationsAsync(Arg.Is<IList<Models.PropertyLimit>>(
                limits => limits.Count == result.PropertyLimits.Count));
    }

    [Test]
    public async Task GivenAnEmptyWorkbook_WhenIGetPropertyLimits_ThenPriorSubmitApprovalServiceIsCalledWithEmptyList()
    {
        // Act
        await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        await _mockPriorSubmitApprovalService.Received(1)
            .EvaluateLocationsAsync(Arg.Is<IList<Models.PropertyLimit>>(
                limits => limits.Count == 0));
    }

    [Test]
    public async Task GivenAWorkbook_WhenPriorSubmitApprovalServiceIsCalledAfterGeolocation_ThenPropertyLimitsContainGeolocationData()
    {
        // Arrange
        SetUpMockAsposeRowExtractor(TestFixtures.StubListOfExtractedRows(), new List<ExtractedRow>());

        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(callInfo => new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            Precision = "ROOFTOP",
            QueriedAddress = callInfo.Arg<string>(),
            FormattedAddress = callInfo.Arg<string>()
        });

        IList<Models.PropertyLimit> capturedLimits = null;
        _mockPriorSubmitApprovalService
            .EvaluateLocationsAsync(Arg.Do<IList<Models.PropertyLimit>>(limits => capturedLimits = limits))
            .Returns(Task.CompletedTask);

        // Act
        await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        capturedLimits.Should().NotBeNull();
        capturedLimits.Should().HaveCount(3);
        capturedLimits.All(pl => pl.InsuredAddress.Latitude != null).Should().BeTrue();
    }

    [Test]
    public async Task GivenAWorkbook_WhenDuplicateAddressAndZipCodeExists_ThenValidationErrorIsReturned()
    {
        // Arrange - Create two rows with same Address1 and Postcode but different other fields
        var extractedRows = new List<ExtractedRow>
        {
            TestFixtures.CreateExtractedRow(addressLine1: "123 Main Street",
                postCode: "12345",
                buildingUse: "RESIDENTIAL"
            ),
            TestFixtures.CreateExtractedRow(addressLine1: "123 Main Street", // SAME address
                postCode: "12345",            // SAME postcode
                buildingUse: "COMMERCIAL"     // DIFFERENT use
            )
        };

        SetUpMockAsposeRowExtractor(extractedRows, new List<ExtractedRow>());

        _mockGeolocationService.GetAsync(Arg.Any<string>()).Returns(callInfo => new GeolocationResult
        {
            Success = true,
            Latitude = 51.5074,
            Longitude = 0.1278,
            Precision = "ROOFTOP",
            QueriedAddress = callInfo.Arg<string>(),
            FormattedAddress = callInfo.Arg<string>()
        });

        // Act
        var result = await _subject.GetPropertyLimitsAsync(_workbook, _clientId, WordingVersionId);

        // Assert
        result.Should().NotBeNull();
        result.ValidationResults.Should().NotBeEmpty();
        result.ValidationResults.Should().HaveCount(2); // One error per duplicate row
        result.ValidationResults.Should().AllSatisfy(vr =>
            vr.Errors.Should().Contain(e =>
                e.ErrorMessage.Contains("Duplicate address found") &&
                e.ErrorMessage.Contains("123 Main Street") &&
                e.ErrorMessage.Contains("12345")));
    }

    [TearDown]
    public void TearDown()
    {
        _workbook.Dispose();
    }
}

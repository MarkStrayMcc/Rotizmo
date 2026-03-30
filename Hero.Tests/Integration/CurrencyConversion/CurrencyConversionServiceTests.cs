using System.Text;
using Hero.Integration.CurrencyConversion;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;

namespace Hero.Tests.Integration.CurrencyConversion;

[TestFixture]
public class CurrencyConversionServiceTests
{
    private const string TestJsonContent = @"{
    ""ConversionRates"": [
        {
          ""BinderSectionId"": 1234,
          ""QuoteCurrency"": ""CAD"",
          ""BinderCurrency"": ""USD"",
          ""ConversionRate"": 0.74
        },
        {
          ""BinderSectionId"": 1290,
          ""QuoteCurrency"": ""CAD"",
          ""BinderCurrency"": ""USD"",
          ""ConversionRate"": 0.75
        },
        {
          ""BinderSectionId"": 1234,
          ""QuoteCurrency"": ""EUR"",
          ""BinderCurrency"": ""USD"",
          ""ConversionRate"": 1.08
        }
      ]
    }";

    private CurrencyConversionService CreateService(string? jsonContent = null)
    {
        var content = jsonContent ?? TestJsonContent;
        
        var configurationBuilder = new ConfigurationBuilder();
        configurationBuilder.AddInMemoryCollection(new Dictionary<string, string>
        {
            { "CurrencyConversion:Filename", "Config/CurrencyConversions.json" }
        });
        var configuration = configurationBuilder.Build();
        
        var environment = Substitute.For<IWebHostEnvironment>();
        var fileInfo = Substitute.For<IFileInfo>();
        fileInfo.Exists.Returns(true);
        fileInfo.CreateReadStream().Returns(_ => new MemoryStream(Encoding.UTF8.GetBytes(content)));
        
        var fileProvider = Substitute.For<IFileProvider>();
        fileProvider.GetFileInfo(Arg.Any<string>()).Returns(fileInfo);
        
        environment.ContentRootFileProvider.Returns(fileProvider);
        
        return new CurrencyConversionService(configuration, environment);
    }

    [Test]
    public void Constructor_WithValidConfiguration_CreatesServiceSuccessfully()
    {
        // Act
        var service = CreateService();

        // Assert
        service.Should().NotBeNull();
    }

    [Test]
    public void Constructor_WithNullConfiguration_ThrowsArgumentNullException()
    {
        // Arrange
        var environment = Substitute.For<IWebHostEnvironment>();

        // Act
        Action act = () => _ = new CurrencyConversionService(null, environment);

        // Assert
        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("configuration");
    }

    [Test]
    public void Constructor_WithNullEnvironment_ThrowsArgumentNullException()
    {
        // Arrange
        var configurationBuilder = new ConfigurationBuilder();
        configurationBuilder.AddInMemoryCollection(new Dictionary<string, string>
        {
            { "CurrencyConversion:Filename", "Config/CurrencyConversions.json" }
        });
        var configuration = configurationBuilder.Build();

        // Act
        Action act = () => new CurrencyConversionService(configuration, null);

        // Assert
        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("environment");
    }

    [Test]
    public void Constructor_WithMissingConfigSection_ThrowsInvalidOperationException()
    {
        // Arrange
        var configurationBuilder = new ConfigurationBuilder();
        var configuration = configurationBuilder.Build();
        
        var environment = Substitute.For<IWebHostEnvironment>();

        // Act
        Action act = () => new CurrencyConversionService(configuration, environment);

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*CurrencyConversion*missing or invalid*");
    }

    [Test]
    public void Constructor_WithMissingFile_ThrowsFileNotFoundException()
    {
        // Arrange
        var configurationBuilder = new ConfigurationBuilder();
        configurationBuilder.AddInMemoryCollection(new Dictionary<string, string>
        {
            { "CurrencyConversion:Filename", "Config/CurrencyConversions.json" }
        });
        var configuration = configurationBuilder.Build();
        
        var environment = Substitute.For<IWebHostEnvironment>();
        var fileInfo = Substitute.For<IFileInfo>();
        fileInfo.Exists.Returns(false);
        
        var fileProvider = Substitute.For<IFileProvider>();
        fileProvider.GetFileInfo(Arg.Any<string>()).Returns(fileInfo);
        
        environment.ContentRootFileProvider.Returns(fileProvider);

        // Act
        Action act = () => new CurrencyConversionService(configuration, environment);

        // Assert
        act.Should().Throw<FileNotFoundException>()
            .WithMessage("*Currency conversion configuration file not found*");
    }

    [Test]
    public void Constructor_WithInvalidJson_ThrowsInvalidOperationException()
    {
        // Act
        Action act = () => CreateService("{}");

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Currency conversion configuration is invalid or empty*");
    }

    [Test]
    public void GetConversionRate_WithValidBinderSectionAndCurrency_ReturnsCorrectRate()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = service.GetConversionRate(1234, "CAD");

        // Assert
        result.Should().Be(0.74m);
    }

    [Test]
    public void GetConversionRate_WithDifferentBinderSectionSameCurrency_ReturnsCorrectRate()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = service.GetConversionRate(1290, "CAD");

        // Assert
        result.Should().Be(0.75m);
    }

    [Test]
    public void GetConversionRate_WithSameBinderSectionDifferentCurrency_ReturnsCorrectRate()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = service.GetConversionRate(1234, "EUR");

        // Assert
        result.Should().Be(1.08m);
    }

    [Test]
    public void GetConversionRate_WithNonExistentBinderSection_ReturnsDefaultRate()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = service.GetConversionRate(9999, "CAD");

        // Assert
        result.Should().Be(1.0m);
    }

    [Test]
    public void GetConversionRate_WithNonExistentCurrency_ReturnsDefaultRate()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = service.GetConversionRate(1234, "GBP");

        // Assert
        result.Should().Be(1.0m);
    }

    [Test]
    public void GetConversionRate_WithLowercaseCurrency_ReturnsCorrectRate()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = service.GetConversionRate(1234, "cad");

        // Assert
        result.Should().Be(0.74m);
    }

    [Test]
    public void GetConversionRate_WithMixedCaseCurrency_ReturnsCorrectRate()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = service.GetConversionRate(1234, "CaD");

        // Assert
        result.Should().Be(0.74m);
    }

    [Test]
    public void GetConversionRate_WithUppercaseCurrency_ReturnsCorrectRate()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = service.GetConversionRate(1234, "CAD");

        // Assert
        result.Should().Be(0.74m);
    }

    [Test]
    public void GetConversionRate_WithEmptyCurrency_ReturnsDefaultRate()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result = service.GetConversionRate(1234, string.Empty);

        // Assert
        result.Should().Be(1.0m);
    }

    [Test]
    public void GetConversionRate_CalledMultipleTimes_ReturnsSameResult()
    {
        // Arrange
        var service = CreateService();

        // Act
        var result1 = service.GetConversionRate(1234, "CAD");
        var result2 = service.GetConversionRate(1234, "CAD");
        var result3 = service.GetConversionRate(1234, "CAD");

        // Assert
        result1.Should().Be(0.74m);
        result2.Should().Be(0.74m);
        result3.Should().Be(0.74m);
        result1.Should().Be(result2).And.Be(result3);
    }
}

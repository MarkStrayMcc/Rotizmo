using System.Text.Json;
using Hero.Models.CurrencyConversion;
using Microsoft.Extensions.FileProviders;

namespace Hero.Integration.CurrencyConversion;

internal sealed class CurrencyConversionService : ICurrencyConversionService
{
    private readonly IReadOnlyDictionary<(int binderSectionId, string quoteCurrency), CurrencyConversionRate> _conversionRates;

    public CurrencyConversionService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(configuration);
        ArgumentNullException.ThrowIfNull(environment);

        var config = configuration
            .GetSection(CurrencyConversionConfig.ConfigurationSectionName)
            .Get<CurrencyConversionConfig>();

        if (string.IsNullOrWhiteSpace(config?.Filename))
            throw new InvalidOperationException($"{CurrencyConversionConfig.ConfigurationSectionName} section is missing or invalid.");

        IFileInfo fileInfo = environment.ContentRootFileProvider.GetFileInfo(config.Filename);

        if (!fileInfo.Exists)
            throw new FileNotFoundException("Currency conversion configuration file not found", config.Filename);

        using Stream stream = fileInfo.CreateReadStream();
        var currencyConfig = JsonSerializer.Deserialize<CurrencyConversionConfiguration>(
            stream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (currencyConfig?.ConversionRates is null)
            throw new InvalidOperationException("Currency conversion configuration is invalid or empty.");

        _conversionRates = currencyConfig.ConversionRates.ToDictionary(
            rate => (rate.BinderSectionId, rate.QuoteCurrency.ToUpperInvariant()),
            rate => rate);
    }

    public decimal GetConversionRate(int binderSectionId, string quoteCurrency)
    {
        var normalizedCurrency = quoteCurrency.ToUpperInvariant();
        var key = (binderSectionId, normalizedCurrency);
        return _conversionRates.TryGetValue(key, out var rate) ? rate.ConversionRate : 1.0m;
    }
}

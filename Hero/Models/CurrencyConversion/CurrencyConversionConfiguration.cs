namespace Hero.Models.CurrencyConversion;

internal sealed class CurrencyConversionConfiguration
{
    public IReadOnlyList<CurrencyConversionRate> ConversionRates { get; init; }
}

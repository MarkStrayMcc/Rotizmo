namespace Hero.Models.CurrencyConversion;

internal sealed record CurrencyConversionConfig
{
    internal const string ConfigurationSectionName = "CurrencyConversion";

    public string Filename { get; init; }
}

namespace Hero.Models.CurrencyConversion;

internal sealed class CurrencyConversionRate
{
    public int BinderSectionId { get; init; }
    public string QuoteCurrency { get; init; }
    public string BinderCurrency { get; init; }
    public decimal ConversionRate { get; init; }
}

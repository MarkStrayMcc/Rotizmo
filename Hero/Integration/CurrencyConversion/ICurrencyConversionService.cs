namespace Hero.Integration.CurrencyConversion;

internal interface ICurrencyConversionService
{
    decimal GetConversionRate(int binderSectionId, string quoteCurrency);
}

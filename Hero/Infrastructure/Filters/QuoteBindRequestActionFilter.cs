using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Models;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Hero.Infrastructure.Filters;

public class QuoteBindRequestActionFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments)
        {
            switch (argument.Value)
            {
                case null:
                    continue;
                case QuoteBindRequest quoteBindRequest:
                    var items = context.HttpContext.Items;
                    AddQuoteMetaDataToDictionary(quoteBindRequest, items);
                    continue;
            }
        }

        await next();
    }
        
    private readonly AppInsightsCustomPropertiesFormatter _formatter = new();

    public void AddQuoteMetaDataToDictionary(QuoteBindRequest quoteBindRequest, IDictionary<object, object> itemsDictionary)
    {
        if (quoteBindRequest.QuoteId != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindRequest.QuoteId), quoteBindRequest.QuoteId);
            itemsDictionary.TryAdd(key, value);
        }
        if (quoteBindRequest?.Product?.ProductId != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindRequest.Product.ProductId), quoteBindRequest.Product.ProductId);
            itemsDictionary.TryAdd(key, value);
        }
        if (quoteBindRequest.Premium != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindRequest.Premium), quoteBindRequest.Premium);
            itemsDictionary.TryAdd(key, value);
        }    
        if (quoteBindRequest.TotalPremium != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindRequest.TotalPremium), quoteBindRequest.TotalPremium);
            itemsDictionary.TryAdd(key, value);
        }
        if (quoteBindRequest?.CommissionInformation?.Fee != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindRequest.CommissionInformation.Fee), quoteBindRequest.CommissionInformation.Fee);
            itemsDictionary.TryAdd(key, value);
        }
        if (quoteBindRequest?.CommissionInformation?.BrokerFee != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindRequest.CommissionInformation.BrokerFee), quoteBindRequest.CommissionInformation.BrokerFee);
            itemsDictionary.TryAdd(key, value);
        }            
        if (quoteBindRequest?.CommissionInformation?.CfcShare != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindRequest.CommissionInformation.CfcShare), quoteBindRequest.CommissionInformation.CfcShare);
            itemsDictionary.TryAdd(key, value);
        }
        if (quoteBindRequest?.CommissionInformation?.ActualGrossCommission != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindRequest.CommissionInformation.ActualGrossCommission), quoteBindRequest.CommissionInformation.ActualGrossCommission);
            itemsDictionary.TryAdd(key, value);
        }            
        if (quoteBindRequest?.CommissionInformation?.OriginalGrossCommission != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindRequest.CommissionInformation.OriginalGrossCommission), quoteBindRequest.CommissionInformation.OriginalGrossCommission);
            itemsDictionary.TryAdd(key, value);
        }
        
        if (!string.IsNullOrWhiteSpace(quoteBindRequest?.Currency?.IsoCode))
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom($"currency{nameof(quoteBindRequest.Currency.IsoCode)}", quoteBindRequest.Currency.IsoCode);
            itemsDictionary.TryAdd(key, value);
        }   
        
        if (quoteBindRequest?.Currency?.Rate != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom($"currency{nameof(quoteBindRequest.Currency.Rate)}", quoteBindRequest.Currency.Rate);
            itemsDictionary.TryAdd(key, value);
        }          
    }
}
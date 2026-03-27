using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using WebApiDto.Dto;

namespace Hero.Infrastructure.Filters;

public class QuoteBindResponseResultFilter : IAsyncResultFilter
{
    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        if (context.Result is OkObjectResult { Value: QuoteBindResponse quoteBindResponse })
        {
            var itemsDictionary = context.HttpContext.Items;
            AddQuoteMetaDataToDictionary(quoteBindResponse, itemsDictionary);
        }
        await next();
    }

    private readonly AppInsightsCustomPropertiesFormatter _formatter = new();

    private void AddQuoteMetaDataToDictionary(QuoteBindResponse quoteBindResponse, IDictionary<object, object> itemsDictionary)
    {
        if (!string.IsNullOrWhiteSpace(quoteBindResponse.PolicyNumber))
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindResponse.PolicyNumber), quoteBindResponse.PolicyNumber);
            itemsDictionary.TryAdd(key, value);
        }
        if (quoteBindResponse.PolicyNumberUid != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quoteBindResponse.PolicyNumberUid), quoteBindResponse.PolicyNumberUid);
            itemsDictionary.TryAdd(key, value);
        }            
    }        
}
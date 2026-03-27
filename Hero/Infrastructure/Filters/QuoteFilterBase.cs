using System.Collections.Generic;
using WebApiDto.Dto;

namespace Hero.Infrastructure.Filters;

public class QuoteFilterBase
{
    private readonly AppInsightsCustomPropertiesFormatter _formatter = new();

    public void AddQuoteMetaDataToDictionary(Quote quote, IDictionary<object, object> itemsDictionary)
    {
        if (quote.DraftQuoteId != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quote.DraftQuoteId), quote.DraftQuoteId);
            itemsDictionary.TryAdd(key, value);
        }

        if (quote.EnquiryId != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quote.EnquiryId), quote.EnquiryId);
            itemsDictionary.TryAdd(key, value);
        }

        if (!string.IsNullOrWhiteSpace(quote.PolicyNumber))
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quote.PolicyNumber), quote.PolicyNumber);
            itemsDictionary.TryAdd(key, value);
        }

        if (quote.QuoteReference != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quote.QuoteReference), quote.QuoteReference);
            itemsDictionary.TryAdd(key, value);
        }

        if (quote.QuoteUid != default)
        {
            var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quote.QuoteUid), quote.QuoteUid);
            itemsDictionary.TryAdd(key, value);
        }
    }
}
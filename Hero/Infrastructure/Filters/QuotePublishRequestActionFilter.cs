using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Infrastructure.Filters
{
    public class QuotePublishRequestActionFilter : IAsyncActionFilter
    {
        private readonly AppInsightsCustomPropertiesFormatter _formatter = new();

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var items = context.HttpContext.Items;

            foreach (var argument in context.ActionArguments)
            {
                switch (argument.Value)
                {
                    case null:
                        continue;
                    case QuotePublishRequest quotePublishRequest:
                        var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(quotePublishRequest.QuoteId), quotePublishRequest.QuoteId);
                        items.TryAdd(key, value);
                        continue;
                }
            }

            await next();
        }
    }
}

using Microsoft.AspNetCore.Mvc.Filters;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Infrastructure.Filters
{
    public class QuoteActionFilter : QuoteFilterBase, IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            foreach (var argument in context.ActionArguments)
            {
                switch (argument.Value)
                {
                    case null:
                        continue;
                    case Quote quoteValue:
                        var items = context.HttpContext.Items;
                        AddQuoteMetaDataToDictionary(quoteValue, items);
                        continue;
                }
            }

            await next();
        }
    }
}

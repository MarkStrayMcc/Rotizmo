using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Infrastructure.Filters
{
    public class QuoteResultFilter : QuoteFilterBase, IAsyncResultFilter
    {
        public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
        {
            if (context.Result is OkObjectResult { Value: Quote quoteObject })
            {
                var itemsDictionary = context.HttpContext.Items;
                AddQuoteMetaDataToDictionary(quoteObject, itemsDictionary);
            }
            await next();
        }
    }
}

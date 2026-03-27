 using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Hero.Infrastructure.Filters;

public class GenericTypeActionFilter<T> : IAsyncActionFilter
{
    private readonly AppInsightsCustomPropertiesFormatter _appInsightsCustomPropertiesFormatter = new();

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments)
        {
            switch (argument.Value)
            {
                case null:
                    continue;
                case T tValue:
                    var items = context.HttpContext.Items;
                    var (key, value) = _appInsightsCustomPropertiesFormatter.ExtractKebabCaseKeyAndValueFrom(argument.Key, argument.Value);
                    items.TryAdd(key, value);
                    continue;
            }
        }

        await next();
    }
}
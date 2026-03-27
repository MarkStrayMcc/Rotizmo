using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi;

public class PropertyLimitsApi : BaseApi, IPropertyLimitsApi
{
    private readonly string _propertyLimitsUrl;

    public PropertyLimitsApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(
        configuration, httpContextAccessor)
    {
        _propertyLimitsUrl = configuration["CoreApi:PropertyLimits"];
    }

    public async Task<List<PropertyLimit>> GetPropertyLimits(int quoteRef)
    {
        return await GetAsyncTyped<List<PropertyLimit>>(_propertyLimitsUrl.Replace("{quoteRef}", quoteRef.ToString()));
    }
}
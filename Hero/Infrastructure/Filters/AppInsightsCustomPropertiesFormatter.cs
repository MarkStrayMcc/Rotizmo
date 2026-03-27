using System;
using System.Text.RegularExpressions;

namespace Hero.Infrastructure.Filters;

public class AppInsightsCustomPropertiesFormatter
{

    public (string key, string value) ExtractKebabCaseKeyAndValueFrom<T>(string inputKey, T inputValue)
    {
        const string preAmble = "x-";

        if (inputKey is null)
            throw new ArgumentNullException(nameof(inputKey));

        if(inputValue is null)
            throw new ArgumentNullException(nameof(inputValue));


        var key = $"{preAmble}{ToKebabCase(inputKey)}";
        var value = inputValue.ToString();

        return (key, value);

    }

    private static string ToKebabCase(string input)
    {
        return Regex.Replace(input, "(?<!^)([A-Z])", "-$1").ToLowerInvariant();
    }

}
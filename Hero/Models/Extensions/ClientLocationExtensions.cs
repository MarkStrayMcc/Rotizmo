using System.Collections.Generic;
using System.Text;

namespace Hero.Models.Extensions;

public static class ClientLocationExtensions
{
    public static string ToFullAddress(this WebApiDto.Dto.ClientLocation clientLocation, Dictionary<int, string> countryNames)
    {
        var builder = new StringBuilder();

        AppendToAddress(builder, clientLocation.Address1);
        AppendToAddress(builder, clientLocation.Address2);
        AppendToAddress(builder, clientLocation.City);
        AppendToAddress(builder, clientLocation.StateProvinceCode);
        AppendToAddress(builder, clientLocation.County);
        AppendToAddress(builder, clientLocation.Postcode);

        var countryName = countryNames?.GetValueOrDefault(clientLocation.CountryId);

        if (countryName is not default(string))
        {
            AppendToAddress(builder, countryName);
        }

        return builder.ToString();
    }

    public static string ToValidationAddress(this WebApiDto.Dto.ClientLocation location, string countryName)
    {
        return ToValidationAddress(location.Address1, location.City, location.StateProvinceCode, location.Postcode, countryName);
    }

    public static string ToValidationAddress(string address1, string city, string stateProvince, string postcode, string countryName)
    {
        var builder = new StringBuilder();

        AppendToAddress(builder, address1);
        AppendToAddress(builder, city);
        AppendToAddress(builder, stateProvince);
        AppendToAddress(builder, postcode);
        AppendToAddress(builder, countryName);

        return builder.ToString();
    }

    private static void AppendToAddress(StringBuilder builder, string addressPart)
    {
        if (string.IsNullOrWhiteSpace(addressPart))
        {
            return;
        }

        if (builder.Length > 0)
        {
            builder.Append(", ");
        }

        builder.Append(addressPart);
    }
}

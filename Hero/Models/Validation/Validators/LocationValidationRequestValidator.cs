using System;
using System.Linq;
using FluentValidation;
using Hero.Integration.CoreApi;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models.Enums;

namespace Hero.Models.Validation.Validators;

public class LocationValidationRequestValidator : AbstractValidator<LocationValidationRequest>
{
    private static readonly string[] CountriesThatHaveStateProvinces = { "US", "Canada", "Australia" };
    private static readonly string[] AllowedCountryIsoCodes = { "GB", "US", "CA" }; // UK, US and Canada only

    public LocationValidationRequestValidator(IListOfCountries countries, ILocationApi locationsApi)
    {
        RuleFor(location => location.Address1).NotEmpty().WithMessage("Address line 1 is required")
            .DependentRules(() =>
            {
                RuleFor(location => location.Address1).MaximumLength(100)
                    .WithMessage("Address line 1 information you have entered exceeds the maximum allowed length of 100 characters");
            });


        RuleFor(location => location.Address2).MaximumLength(100)
            .WithMessage("Address line 2 information you have entered exceeds the maximum allowed length of 100 characters");

        RuleFor(location => location.Address3).MaximumLength(100)
            .WithMessage("Address line 3 information you have entered exceeds the maximum allowed length of 100 characters");
        RuleFor(location => location.City).NotEmpty().WithMessage("City is required")
            .DependentRules(() =>
            {
                RuleFor(location => location.City).MaximumLength(30)
                    .WithMessage("City information you have entered exceeds the maximum allowed length of 30 characters");
            });

        RuleFor(location => location.Postcode).NotEmpty().WithMessage("Postcode is required")
            .DependentRules(() =>
            {
                RuleFor(location => location.Postcode).MaximumLength(10)
                    .WithMessage("Postcode/zipcode information you have entered exceeds the maximum allowed length of 10 characters");
            });

        RuleFor(location => location.CountryName).NotEmpty().WithMessage("CountryName is required")
            .DependentRules(() =>
            {
                WebApiDto.Dto.Country matchedCountry = null;
                RuleFor(location => location.CountryName)
                    .MustAsync(async (country, cancellation) =>
                    {
                        matchedCountry = await countries.GetCountryByName(country);
                        return matchedCountry != null;
                    })
                    .WithMessage(location => "Country information you have entered is invalid")
                    .DependentRules(() =>
                    {
                        // Validate that country is UK, US or CA only
                        RuleFor(location => location.CountryName)
                            .MustAsync(async (country, cancellation) =>
                            {
                                var countryObj = await countries.GetCountryByName(country);
                                return countryObj != null && AllowedCountryIsoCodes.Contains(countryObj.IsoCode);
                            })
                            .WithMessage(location =>
                                $"Country '{location.CountryName}' is not allowed.");

                        RuleFor(location => location.StateProvince)
                            .NotEmpty()
                            .WithMessage("StateProvince is required")
                            .DependentRules(() =>
                            {
                                RuleFor(location => location).MustAsync(async (location, cancellation) =>
                                {
                                    var states = await locationsApi.GetCountryStates(matchedCountry?.IsoCode);
                                    var matchedState =
                                        states?.FirstOrDefault(x => x.Description == location.StateProvince);
                                    return matchedState != null;
                                }).WithMessage(location =>
                                    "State province code you have entered is not a valid state province within the country");
                            })
                            .When(location => CountriesThatHaveStateProvinces.Contains(location.CountryName));
                    });
            });

        RuleFor(location => location.BuildingUse).NotEmpty().WithMessage("Building use is required")
            .DependentRules(() =>
            {
                RuleFor(location => location.BuildingUse).Must(buildingUse => Enum.IsDefined(typeof(BuildingUseTypes), buildingUse.Trim().ToUpperInvariant()))
                    .WithMessage("Invalid building use value");
            });
    }
}

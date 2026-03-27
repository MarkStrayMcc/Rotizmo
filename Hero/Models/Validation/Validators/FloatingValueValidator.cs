using FluentValidation;
using Hero.Integration.Aspose.MultipleProperties.Terrorism;

namespace Hero.Models.Validation.Validators;

public class FloatingValueValidator : AbstractValidator<FloatingValueValidationRequest>
{
    public FloatingValueValidator()
    {
        CheckFloatingValue(TemplateConfiguration.ContentsDamageLimit);
        CheckFloatingValue(TemplateConfiguration.ActualLossSustainedLimit);
        CheckFloatingValue(TemplateConfiguration.IncreasedCostOfWorkingLimit);
        CheckFloatingValue(TemplateConfiguration.LossOfRentLimit);
        CheckFloatingValue(TemplateConfiguration.AlternativeAccommodationLimit);
    }

    private void CheckFloatingValue(string templateConfiguration)
    {
        RuleFor(x => x.ExtractedFloatingValueRow[templateConfiguration].IntegerValue)
            .GreaterThanOrEqualTo(0).WithMessage(x =>
                x.ExtractedFloatingValueRow[templateConfiguration].ColumnName +
                " value cannot be negative");
    }
}

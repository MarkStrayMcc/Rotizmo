using Hero.Models.Validation;
using System.Collections.Generic;
using WebApiDto.Dto;

namespace Hero.Models
{
    public class TemplateUploadResult
    {
        public List<PropertyLimit> PropertyLimits { get; set; }
        public PropertyLimitFloatingValues PropertyLimitFloatingValues { get; set; }
        public List<ValidationResult> ValidationResults { get; set; }
        public int? FirstLossLimitValue { get; set; }
        public string? TemplateValidationError { get; set; }
    }
}

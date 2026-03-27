namespace Hero.Models.Validation
{
    public class ValidationResult : FluentValidation.Results.ValidationResult
    {
        public ValidationResult() : base()
        {
        }

        public string LocationIdentifier { get; set; }
        public string ValidationAddress { get; set; }
    }
}

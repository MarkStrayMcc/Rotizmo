using System;
using System.Diagnostics.CodeAnalysis;

namespace Hero.Models.Exceptions
{
    [ExcludeFromCodeCoverage]
    public class RequestEnrichmentException : Exception
    {
        public RequestEnrichmentException() { }

        public RequestEnrichmentException(string message) : base(message) { }

        public RequestEnrichmentException(string message, Exception innerException) : base(message, innerException) { }
    }
}
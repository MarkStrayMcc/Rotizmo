using System;

namespace Hero.Infrastructure.Exceptions
{
    public class ValidationException : Exception
    {
        public ValidationException(string message = "One or more validation failures have occurred.") : base(message) { }
    }
}
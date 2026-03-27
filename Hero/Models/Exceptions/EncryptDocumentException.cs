using System;
using System.Diagnostics.CodeAnalysis;

namespace Hero.Models.Exceptions
{
    [ExcludeFromCodeCoverage]
    public class EncryptDocumentException : Exception
    {
        public EncryptDocumentException() { }

        public EncryptDocumentException(string message) : base(message) { }

        public EncryptDocumentException(string message, Exception innerException) : base(message, innerException) { }
    }

}

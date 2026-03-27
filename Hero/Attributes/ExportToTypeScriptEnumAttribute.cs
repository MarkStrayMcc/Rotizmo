using System;

namespace Hero.Attributes
{
    [AttributeUsage(AttributeTargets.Enum, Inherited = false, AllowMultiple = false)]
    public class ExportToTypeScriptEnumAttribute : Attribute
    {
    }
}

using System;

namespace Hero.Models
{
    public enum ServerSideFileType
    {
        Quote = 1,
        Policy = 2,
        Wording = 3,
        [Obsolete("Use InsurerList")]
        SLTaxFilingNotice = 4,
        InsurerList = 4,
        Custom = 5,
        DebitNote = 6
    }
}

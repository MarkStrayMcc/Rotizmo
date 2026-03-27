using WebApiDto.Enum;

namespace Hero.Infrastructure
{
    public class QuoteTypeHelper
    {
        public static string NewBusiness = "NB";
        public static string Renewal = "RN";

        public static string QuoteTypeFromEnquiryType(EnquiryType enquiryType)
        {
            switch (enquiryType)
            {
                case EnquiryType.Renewal:
                    return QuoteTypeHelper.Renewal;

                case EnquiryType.New:
                    return QuoteTypeHelper.NewBusiness;

                default:
                    return QuoteTypeHelper.NewBusiness;
            }
        }
    }
}

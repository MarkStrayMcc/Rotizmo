using Microsoft.AspNetCore.Builder;
using System;

namespace Hero.Init
{
    public static class AsposeConfigurationExtensions
    {
        public static IApplicationBuilder UseAspose(this IApplicationBuilder app)
        {
            var cellsLicense = new Aspose.Cells.License();

            try
            {
                cellsLicense.SetLicense("Aspose.Cells.Product.Family.lic");
                Console.WriteLine("Aspose Cells License set successfully.");
            }
            catch (Exception e)
            {
                Console.WriteLine("\nThere was an error setting Aspose licenses: " + e.Message);
            }

            return app;
        }
    }
}

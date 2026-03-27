using System;
using System.Linq;
using Azure.Identity;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.HttpSys;
using Microsoft.Extensions.Configuration;

namespace Hero
{
    public class Program
    {
        public static readonly string HeroPrefix = "HERO_";
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args)
        {
            var filteredArgs = args.Where(a => a != "--useHttpSys").ToArray();
            IWebHostBuilder builder = WebHost.CreateDefaultBuilder(filteredArgs).ConfigureAppConfiguration(config =>
            {
                var configValues = config.Build();
                IConfigurationSection configSection = configValues.GetSection("FeatureFlag");

                config.AddAzureAppConfiguration(options =>
                {
                    if (string.IsNullOrEmpty(configSection.GetValue("ConnectionString", "")))
                    {
                        options.Connect(new Uri(configSection.GetValue("BaseAddress", "")), GetAppConfigurationManagedIdentityCredential(configSection));
                    }
                    else
                    {
                        options.Connect(configSection.GetValue("ConnectionString", ""));
                    }

                    options.UseFeatureFlags(flagOptions =>
                    {
                        flagOptions
                                .Select($"{HeroPrefix}*", configSection.GetValue("Environment", "Dev"))
                                .CacheExpirationInterval = TimeSpan.FromSeconds(30);
                    });
                });

            }).UseStartup<Startup>();

            if (args.Contains("--useHttpSys"))
            {

                builder = builder.UseHttpSys(
                    options =>
                    {
                        options.Authentication.Schemes = AuthenticationSchemes.NTLM | AuthenticationSchemes.Negotiate;
                        options.Authentication.AllowAnonymous = false;
                    });
            }

            return builder;
        }

        private static DefaultAzureCredential GetAppConfigurationManagedIdentityCredential(IConfigurationSection configurationSection)
        {
            var appConfigurationManagedIdentityClientId = configurationSection.GetValue("ConfigurationIdentityClientId", "");

            return new DefaultAzureCredential(
                    new DefaultAzureCredentialOptions()
                    {
                        ManagedIdentityClientId = new Azure.Core.ResourceIdentifier(appConfigurationManagedIdentityClientId)
                    });
        }

    }
}

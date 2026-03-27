using AutoMapper;
using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Cfc.ActiveDirectory;
using Cfc.CoreApi.Integration;
using FluentValidation;
using Hero.Infrastructure;
using Hero.Infrastructure.Filters;
using Hero.Init;
using Hero.Integration.Aspose;
using Hero.Integration.Aspose.MultipleProperties;
using Hero.Integration.Aspose.MultipleProperties.Terrorism;
using Hero.Integration.BlastZoneApi;
using Hero.Integration.BlobStorage;
using Hero.Integration.Cache;
using Hero.Integration.CoreApi;
using Hero.Integration.CoreApi.DraftQuote;
using Hero.Integration.CoreApi.Finance.OutstandingFunds;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.CoreApi.Language;
using Hero.Integration.CoreApi.PolicyAdditionalInsured;
using Hero.Integration.CoreApi.PolicyLossPayee;
using Hero.Integration.CoreApi.Subjectivities;
using Hero.Integration.CoreApi.SurplusLines;
using Hero.Integration.CoreApi.Tax;
using Hero.Integration.CoreApi.TransactionBilling;
using Hero.Integration.CreatePolicyMtaApi;
using Hero.Integration.CreatePolicyMtaApi.LossPayeeApi;
using Hero.Integration.CurrencyConversion;
using Hero.Integration.DDPTApi;
using Hero.Integration.DDPTApi.Interfaces;
using Hero.Integration.DirectBilling;
using Hero.Integration.EnrichmentAdapter;
using Hero.Integration.FeeCalculatorApi;
using Hero.Integration.Geolocation;
using Hero.Integration.HeroEmails;
using Hero.Integration.HeroEmails.Interfaces;
using Hero.Integration.PriorSubmit;
using Hero.Integration.SanctionsScreening;
using Hero.Integration.SearchServiceApi;
using Hero.Integration.SearchServiceApi.Interfaces;
using Hero.Integration.SubjectivityConfigurationApi;
using Hero.Integration.Transaction;
using Hero.Models.Validation;
using Hero.Models.Validation.Validators;
using Hero.Telemetry;
using Microsoft.ApplicationInsights.DependencyCollector;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.FeatureManagement;

namespace Hero
{
    public class Startup
    {
        private const string CoreApiBaseUrlKey = "CoreApi:BaseUrl";

        public Startup(IWebHostEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddUserSecrets<Startup>()
                .AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLogging(logging =>
            {
                logging.AddApplicationInsights();
                logging.AddConsole();
            });

            services.AddMvc(options => options.EnableEndpointRouting = false);
            services.AddMemoryCache();

            services.AddAutoMapper(typeof(Startup));
            services.AddHttpContextAccessor();
            services.AddSingleton(Configuration);
            services.AddDistributedRedisCache(options =>
            {
                options.InstanceName = Configuration.GetSection("Redis").GetValue("InstanceName", "Hero");
                options.Configuration = Configuration.GetSection("Redis").GetValue("connection", "localhost");
            });

            services.AddSession(options => options.IdleTimeout = TimeSpan.FromMinutes(30));

            #region Dependency Injection
            services.AddSingleton<ITemplateColumnValidator, TemplateColumnValidator>();
            services.AddTransient<IProductApi, ProductApi>();
            services.AddTransient<ICfcContactApi, CfcContactApi>();
            services.AddTransient<ILocationApi, LocationApi>();
            services.AddTransient<ICountryApi, CountryApi>();
            services.AddTransient<ICurrencyApi, CurrencyApi>();
            services.AddTransient<IEnquiryApi, EnquiryApi>();
            services.AddTransient<IInsuranceTypeApi, InsuranceTypeApi>();
            services.AddTransient<IActivityApi, ActivityApi>();
            services.AddTransient<IActivityMapApi, ActivityMapApi>();
            services.AddTransient<ISubjectivityApi, SubjectivityApi>();
            services.AddTransient<ICacheHelper, CacheHelper>();
            services.AddTransient<IClientNoteApi, ClientNoteApi>();
            services.AddTransient<IEndorsementApi, EndorsementApi>();
            services.AddTransient<IRiskApi, RiskApi>();
            services.AddTransient<ITaxApi, TaxApi>();
            services.AddTransient<IBrokerApi, BrokerApi>();
            services.AddTransient<IEmailApi, EmailApi>();
            services.AddTransient<IEmailContactApi, EmailContactApi>();
            services.AddTransient<IQuoteApi, QuoteApi>();
            services.AddTransient<IWordingVersionApi, WordingVersionApi>();
            services.AddTransient<ICoverageApi, CoverageApi>();
            services.AddTransient<IPricingApi, PricingApi>();
            services.AddTransient<IBinderValidationApi, BinderValidationApi>();
            services.AddTransient<IBinderSectionParticipationApi, BinderSectionParticipationApi>();
            services.AddTransient<ISurplusLineApi, SurplusLineApi>();
            services.AddTransient<IFinancialLedgerApi, FinancialLedgerApi>();
            services.AddTransient<IEcfReconciliationApi, EcfReconciliationApi>();
            services.AddTransient<IEcfReconciliationGroupApi, EcfReconciliationGroupApi>();
            services.AddTransient<IClaimFinancialItemApi, ClaimFinancialItemApi>();
            services.AddTransient<ICfcBankAccountApi, CfcBankAccountApi>();
            services.AddTransient<ICfcContactPersonalMessageApi, CfcContactPersonalMessageApi>();
            services.AddTransient<IBrokerTeamApi, BrokerTeamApi>();
            services.AddTransient<IBrokerGroupApi, BrokerGroupApi>();
            services.AddTransient<IReferralApi, ReferralApi>();
            services.AddTransient<IFeaturesApi, FeaturesApi>();
            services.AddTransient<ILossFundApi, LossFundApi>();
            services.AddTransient<IBinderApi, BinderApi>();
            services.AddTransient<IFeeApi, FeeApi>();
            services.AddTransient<IMarketTypeApi, MarketTypeApi>();
            services.AddTransient<IWordingVersionsApi, WordingVersionsApi>();
            services.AddTransient<IClientApi, ClientApi>();
            services.AddTransient<IClientClearanceApi, ClientClearanceApi>();
            services.AddTransient<IUserAuthorityApi, UserAuthorityApi>();
            services.AddTransient<ISendEuDocumentsApi, SendEuDocumentsApi>();
            services.AddTransient<IQuoteEmailApi, QuoteEmailApi>();
            services.AddTransient<IPolicyEmailApi, PolicyEmailApi>();
            services.AddTransient<IDraftQuoteApi, DraftQuoteApi>();
            services.AddTransient<IBrokerContactApi, BrokerContactApi>();
            services.AddTransient<IFeeCalculatorApi, FeeCalculatorApi>();
            services.AddTransient<IDirectBillingApi, DirectBillingApi>();
            services.AddTransient<IPropertyLimitsApi, PropertyLimitsApi>();
            services.AddTransient<ILossPayeeClient, LossPayeeClient>();
            services.AddTransient<ITransactionApi, TransactionApi>();
            services.AddTransient<IMultiplePropertyService, MultiplePropertyService>();
            services.AddTransient<IMultiplePropertyOrchestrator, TerrorismOrchestrator>();
            services.AddTransient<IPriorSubmitApproval, UsPriorSubmitApproval>();
            services.AddTransient<IPriorSubmitApprovalService, PriorSubmitApprovalService>();
            services.AddTransient<IAsposeRowExtractor, AsposeRowExtractor>();
            services.AddTransient<IAsposeRowInserter, AsposeRowInserter>();
            services.AddTransient<IGeolocationService, GeolocationService>();
            services.AddTransient<IBlastZoneService, BlastZoneService>();
            services.AddSingleton<IListOfCountries, ListOfCountries>();
            services.AddSingleton<ICurrencyConversionService, CurrencyConversionService>();
            services.AddScoped<IValidator<LocationValidationRequest>, LocationValidationRequestValidator>();
            services.AddScoped<IValidator<FloatingValueValidationRequest>, FloatingValueValidator>();
            services.AddTransient<IIdentityHelper, IdentityHelper>();
            services.AddSingleton<ICfcActiveDirectory, CfcActiveDirectory>();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddScoped<GeolocationDelegatingHandler>();
            services.AddTransient<IHeroEmailingService, HeroEmailingService>();
            services.AddTransient<ISanctionsScreeningService, SanctionsScreeningService>();
            services.AddTransient<ICreateAndScreenApiRequestBuilder, CreateAndScreenApiRequestBuilder>();

            services.AddHttpClient<ISubjectivitiesClient, SubjectivitiesClient>(c =>
                c.BaseAddress = new Uri(Configuration[CoreApiBaseUrlKey]));
            services.AddHttpClient<ILanguageClient, LanguageClient>(c =>
                c.BaseAddress = new Uri(Configuration[CoreApiBaseUrlKey]));
            services.AddHttpClient<ISurplusLinesLicenseClient, SurplusLinesLicenseClient>(c =>
                c.BaseAddress = new Uri(Configuration[CoreApiBaseUrlKey]));
            services.AddHttpClient<ITaxClient, TaxClient>(c =>
                c.BaseAddress = new Uri(Configuration[CoreApiBaseUrlKey]));
            services.AddHttpClient<ICoreMtaClient, CoreMtaClient>(c =>
                c.BaseAddress = new Uri(Configuration[CoreApiBaseUrlKey]));
            services.AddHttpClient<ISendEuDocumentsClient, SendEuDocumentsClient>(c =>
                c.BaseAddress = new Uri(Configuration[CoreApiBaseUrlKey]));
            services.AddHttpClient<IOutstandingFundsClient, OutstandingFundsClient>(c =>
                c.BaseAddress = new Uri(Configuration[CoreApiBaseUrlKey]));
            services.AddHttpClient<IPolicyAdditionalInsuredClient, PolicyAdditionalInsuredClient>(c =>
                c.BaseAddress = new Uri(Configuration[CoreApiBaseUrlKey]));
            services.AddHttpClient<IPolicyLossPayeeClient, PolicyLossPayeeClient>(c =>
                c.BaseAddress = new Uri(Configuration[CoreApiBaseUrlKey]));
            services.AddHttpClient<ITransactionBillingClient, TransactionBillingClient>(c =>
                c.BaseAddress = new Uri(Configuration[CoreApiBaseUrlKey]));
            services.AddHttpClient<IGeolocationClient, GeolocationClient>(c =>
                c.BaseAddress = new Uri(Configuration["GeoLocation:BaseUrl"]))
                .AddHttpMessageHandler<GeolocationDelegatingHandler>();

            services.AddCfcApiHttpClient<IBlastZoneApi, BlastZoneApi>(Configuration, "BlastZoneApi:BaseUrl");
            services.AddCfcApiHttpClient<IEnrichmentAdapterApi, EnrichmentAdapterApi>(Configuration, "EnrichmentAdapterApi:BaseUrl");
            services.AddCfcApiHttpClient<IClientsApi, ClientsApi>(Configuration, "CheckClientSanctions:BaseUrl");
            services.AddCfcApiHttpClient<IDirectBillingApi, DirectBillingApi>(Configuration, "DirectBillingApi:BaseUrl");
            services.AddCfcApiHttpClient<IAdditionalInsuredClient, AdditionalInsuredClient>(Configuration, "CreatePolicyMtaApi:BaseUrl");
            services.AddCfcApiHttpClient<IEmailTemplateClient, EmailTemplateClient>(Configuration, "CreatePolicyMtaApi:BaseUrl");
            services.AddCfcApiHttpClient<IManualChangeClient, ManualChangeClient>(Configuration, "CreatePolicyMtaApi:BaseUrl");
            services.AddCfcApiHttpClient<ICancellationClient, CancellationClient>(Configuration, "CreatePolicyMtaApi:BaseUrl");
            services.AddCfcApiHttpClient<ISubjectivityConfigurationApi, SubjectivityConfigurationApi>(Configuration, "SubjectivityConfigurationApi:BaseUrl");
            services.AddCfcApiHttpClient<IPortfolioApi, PortfolioApi>(Configuration, "SearchService:PortfolioSearch");
            services.AddCfcApiHttpClient<IRequestEnrichmentApi, RequestEnrichmentApi>(Configuration, "RequestEnrichment:BaseUrl");
            services.AddCfcApiHttpClient<IUnderwritingDistributionApi, UnderwritingDistributionApi>(Configuration, "UnderwritingDistribution:BaseUrl");
            services.AddCfcApiHttpClient<IQuoteDocumentService, QuoteDocumentService>(Configuration, "QuoteDocumentService:BaseUrl");
            services.AddCfcApiHttpClient<IPolicyDocumentService, PolicyDocumentService>(Configuration, "PolicyDocumentService:BaseUrl");
            services.AddSanctionsScreeningApiHttpClient<ISanctionsScreeningApi, SanctionsScreeningApi>(Configuration, "SanctionsScreeningApi:BaseUrl");


            services.AddSingleton<ITelemetryInitializer, ApplicationInsightsRoleNameInitializer>();
            services.AddSingleton<ITelemetryInitializer, CustomPropertiesTelemetryInitializer>();
            services.AddSingleton<ITelemetryInitializer, TreatNotFoundAsSuccessTelemetryInitializer>();
            services.AddTransient<IBordereauAPI, BordereauAPI>();
            services.AddScoped<IStorageService>(sp => new StorageService(new BlobServiceClient(Configuration["BlobStorage:ConnectionString"]),
                                                                         new TableClient(Configuration["BlobStorage:ConnectionString"], "multiplepropertybusinesslinesandproducts")));

            services.AddSingleton(sp => ColumnConfigurations.LoadFromConfig(
                Configuration,
                sp.GetRequiredService<IWebHostEnvironment>()));
            #endregion

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });

            services.AddApplicationInsightsTelemetry();
            services.AddFeatureManagement();
            services.AddAzureAppConfiguration();
            services.ConfigureTelemetryModule<DependencyTrackingTelemetryModule>((module, o) =>
            {
                module.EnableSqlCommandTextInstrumentation = true;
            });

            services.AddMvc(options =>
            {
                options.Filters.Add<QuoteActionFilter>();
                options.Filters.Add<QuoteResultFilter>();
                options.Filters.Add<QuoteBindRequestActionFilter>();
                options.Filters.Add<QuoteBindResponseResultFilter>();
                options.Filters.Add<GenericTypeActionFilter<int>>();
                options.Filters.Add<GenericTypeActionFilter<Guid>>();
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (!env.IsProduction() && !env.IsStaging())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseAzureAppConfiguration();
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseSession();
            app.UseAspose();

            app.UseMiddleware<CfcAuthenticationMiddleware>();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (!env.IsProduction() && !env.IsStaging())
                {
                    string configurationSuffix = string.Empty;
                    string environmentName = env.EnvironmentName.ToLower();
                    switch (environmentName)
                    {
                        case "ada":
                        case "vision":
                        case "dragon":
                        case "shield":
                        case "flux":
                            configurationSuffix = $"-{environmentName}";
                            break;
                        default:
                            break;
                    }

                    // Use "start-ie" to run in Internet Explorer
                    spa.UseAngularCliServer(npmScript: $"start{configurationSuffix}");

                }
            });
        }
    }
}

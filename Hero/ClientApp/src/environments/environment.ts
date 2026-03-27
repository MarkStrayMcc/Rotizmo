// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    appInsights: {
        instrumentationKey: 'b5eae225-8c30-4427-99cb-ab99f72a8cfd' // RC key
    },
    api: {
        nerdUrl: "https://devada-nerd.cfcunderwriting.com",
        bulkQuotingUrl: "https://devvision-bulkquotingapi.cfcunderwriting.com",
        adminUrl: "http://rc-cfcadmin",
        qlikDashboardUrl: "https://cfcdata.uk.qlikcloud.com/sense/app/66fca053-f11a-4b0f-a562-ab64a2dc6f48/",
    }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import "zone.js/plugins/zone-error";  // Included with Angular CLI.

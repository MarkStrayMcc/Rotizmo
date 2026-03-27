
// This an auto-generated file using TypeWriter extension for Visual Studio.
// Please do not manually edit it. In order to modify the auto-generated class, either modify the ViewModels.tst file
// Or edit the original class that was decorated with ExportToTypeScript attribute

import * as Models from "@app/models/auto-generated";
export class CoverageType {  
    public id: number;
    public name: string;
    public isMandatory: boolean;
    public isSelectedByDefault: boolean;
    public businessLine: Models.Tag;
    public insuringClauseCode: Models.Tag;
    public insuringClauseSectionCode: Models.Tag;
    public childCoverageTypes: Models.CoverageType[];
    public limitTypes: Models.CoverageLimitType[];
    public excessTypes: Models.CoverageExcessType[];
    public isAdditionalCoverage: boolean;
    public additionalCoverageCategories: Models.Tag[];
    public order: number; 
}

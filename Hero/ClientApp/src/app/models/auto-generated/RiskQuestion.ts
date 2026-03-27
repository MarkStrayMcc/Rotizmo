// This an auto-generated file using TypeWriter extension for Visual Studio.
// Please do not manually edit it. In order to modify the auto-generated class, either modify the ViewModels.tst file
// Or edit the original class that was decorated with ExportToTypeScript attribute

import * as Models from "@app/models/auto-generated";
export class RiskQuestion {
	public tag: string;
	public label: string;
	public isMandatory: boolean;
	public type: Models.RiskQuestionType;
	public tooltipText: string;
	public displayOrder: number;
	public showOnStep: Models.QuoteStep;
	public isVisible: boolean;
	public defaultAnswer: Models.RiskQuestionDefaultAnswer;
	public dependencies: Models.RiskQuestionDependency[];
	public options: Models.RiskQuestionOption[];
	public isEnrichment: boolean;
}

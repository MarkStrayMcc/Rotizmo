import { DocumentScope, Document } from "@app/models";

export class Constants {
    public static emptyGuid: string = "00000000-0000-0000-0000-000000000000";
    public static bespokeClauseId: number = -999999;
    public static bespokeEndorsement: Document = {
        documentId: Constants.bespokeClauseId,
        documentVersionId: Constants.bespokeClauseId,
        documentTypeId: 1,
        reference: "",
        title: "Bespoke Clause",
        description: "Bespoke Clause",
        riskQuestionTags: [],
        lockedOn: null,
        lockedBy: null,
        createdOn: null,
        createdBy: null,
        deletedOn: null,
        deletedBy: null,
        isMandatory: false,
        scopeId: DocumentScope.All
    };
    public static additionalInsuredEndorsementReferences: string[] = [ "2134", "1982", "2289", "2624", "3107" ];
    public static lossPayeeEndorsementReferences: string[] = [ "224", "2129", "2266", "2613", "4856" ];
    public static frenchTerritoriesReference = "5168";
    public static getMultiplePropertyEndorsementReferences(multiplePropertiesClauseForFrenchTerritories:boolean = true): string[] {
        const multiplePropertyEndorsementReferences: string[] = [ "3645", "3646" ];
        if(multiplePropertiesClauseForFrenchTerritories){
            multiplePropertyEndorsementReferences.push(this.frenchTerritoriesReference);
        }
        return multiplePropertyEndorsementReferences;
    }
    public static cpmProductCode: string = "CPM";
    public static ausIsoCode: string = "AU";
    public static gsaBrokerGroupId: number = 1097;
}

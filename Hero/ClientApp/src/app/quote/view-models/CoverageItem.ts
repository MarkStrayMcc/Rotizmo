import { Coverage, CoverageLimit, CoverageExcess } from "@app/models";

export class CoverageItem {
    public isSelected: boolean;
    public coverage: Coverage;
    public childCoverageItems: CoverageItem[];
    public leadLimits: { [code: string]: CoverageLimit };
    public leadExcesses: { [code: string]: CoverageExcess };
}

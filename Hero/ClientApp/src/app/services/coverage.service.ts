import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";

import { Coverage, CoverageType } from "@app/models";
import { CoverageHttpService } from "./coverage-http.service";
import { map, tap } from "rxjs/operators";
import { MultiplePropertyBusinessLines } from "@app/quote/models/MultiplePropertyBusinessLines";

@Injectable()
export class CoverageService {

	constructor(private coverageHttpService: CoverageHttpService) { }

	private _isBICoverageSelected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	private _totalInsuredLimitValue: number = 0;
    private _firstLossLimitValue: number = 0;
	private _multiplePropertiesBusinessLine: string;

    public get totalInsuredLimitValue(): number {
        return this._totalInsuredLimitValue;
    }
    public set totalInsuredLimitValue(value: number) {
        this._totalInsuredLimitValue = value;
    }

    public get firstLossLimitValue(): number {
        return this._firstLossLimitValue;
    }

    public set firstLossLimitValue(value: number) {
        this._firstLossLimitValue = value;
    }

    public getSelectedCoverageIndex(coverages: Coverage[], coverageTypeCode: string, isChildCoverages: boolean): number {
        return isChildCoverages ? coverages.findIndex(coverage => coverage.coverageType.insuringClauseSectionCode.name === coverageTypeCode)
            : coverages.findIndex(coverage => coverage.coverageType.insuringClauseCode.name === coverageTypeCode);
    }

    public getSelectedChildCoverageIndex(coverages: Coverage[], parentIndex: number, childCoverageTypeCode: string): number {
        return coverages[parentIndex].childCoverages.findIndex(
            childCoverage => childCoverage.coverageType.insuringClauseSectionCode.name === childCoverageTypeCode);
    }

    public getSelectedAdditionalCoverageIndexByName(coverages: Coverage[], coverageTypeName: string): number {
        return coverages.findIndex(coverage =>
            coverage.coverageType.name === coverageTypeName && coverage.coverageType.isAdditionalCoverage);
    }

	public get isBICoverageSelected(): boolean {
		return this._isBICoverageSelected.value;
	}

    public getSelectedCoverage(coverages: Coverage[], coverageType: CoverageType, isChild: boolean): Coverage {
        if (!coverages || coverages.length === 0) {
            return null;
        }

        for (const parent of coverages) {
            if (isChild === false) {
                if (parent.coverageType.insuringClauseCode?.name === coverageType.insuringClauseCode?.name) {
                    return parent;
                }
            } else if (parent.childCoverages) {
                for (const child of parent.childCoverages) {
                    if (child.coverageType.insuringClauseSectionCode?.name === coverageType.insuringClauseSectionCode?.name) {
                        return child;
                    }
                }
            }
        }

        return null;
    }

	public getAvailableSelectedCoverages(coverages: Coverage[], coverageTypes: CoverageType[], wasWordingChanged: boolean): Coverage[] {
		if (wasWordingChanged) return [];
        const filtered = coverages.filter(coverage => this.isInCoverageTypeList(coverageTypes, coverage.coverageType));
		return filtered;
	}

	public getCoveragesByCode(coverages: Coverage[], coverageCode: string): Coverage[] {
        return coverages.filter(coverage => coverage.coverageType.businessLine.name === coverageCode);
	}

    public getInsuringClauseSectionLimitByCode(coverage: Coverage, insuringClauseSectionLimitCode: string): number {
        const childCoverage = coverage.childCoverages.find(childCoverage => childCoverage.limits.find(limit => limit.coverageLimitType.limitTypeCode === insuringClauseSectionLimitCode));
        return !!childCoverage ? childCoverage.limits[0].limit : null;
    }

    public getInsuringClauseSectionLimitNameByCode(coverages: Coverage[], insuringClauseSectionLimitCode: string): string {
        let childCoverage: Coverage;

        coverages.forEach(coverage => {
            if (!childCoverage) {
                childCoverage = coverage.childCoverages.find(childCoverage => childCoverage.limits.find(limit => limit.coverageLimitType.limitTypeCode === insuringClauseSectionLimitCode));
            }
        });

        return !!childCoverage ? childCoverage.coverageType.name : null;
    }

    private isInCoverageTypeList(coverageTypes: CoverageType[], coverageType: CoverageType): boolean {
        return coverageTypes.some(c => c.insuringClauseCode?.name == coverageType.insuringClauseCode?.name ||
            c.insuringClauseSectionCode?.name == coverageType.insuringClauseSectionCode?.name);
    }

	public isQuoteHasBICoverage(coverages: Coverage[]) {
		const index = coverages.findIndex((c) => c.coverageType?.insuringClauseCode?.name === "MDBI");
		this._isBICoverageSelected.next(index === -1 ? false : true);
	}

	public isMultiplePropertyBusinessLineProduct(businessLine: string, productCode: string): Observable<boolean> {
		return this.coverageHttpService.getMultiplePropertyBusinessLineProducts(businessLine).pipe(
			map((data: MultiplePropertyBusinessLines) => {
				const result = data.products?.some((p) => p.productName === productCode);
				return result;
			}),
			tap((result) => {
				if (result) {
					this.setMultiplePropertiesBusinessLine(businessLine);
				}
			})
		);
	}

	public setMultiplePropertiesBusinessLine(businessLine: string) {
		this._multiplePropertiesBusinessLine = businessLine;
	}

	public getMultiplePropertiesBusinessLine(): string {
		return this._multiplePropertiesBusinessLine;
	}
}

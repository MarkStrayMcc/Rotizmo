import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { QuoteService } from "@app/quote/services/quote.service";
import { CoverageService } from "@app/services/coverage.service";
import { isEqual } from "lodash";
import { PropertyLimitCodes } from "./property-limit-codes.enum";
import { PropertyLimitMatch } from "./property-limit-match.model";
import { PropertyLimit } from "../../../../../models/property-limit.model";

@Injectable({ providedIn: "root" })
export class PropertyLimitsValidator {
	private _limitValidation: PropertyLimitMatch;
	constructor(private readonly coverageService: CoverageService, private readonly quoteService: QuoteService) {}

	public getPropertyCoverageLimits(): PropertyLimit {
		const quote = this.quoteService.getQuoteReference();
		const propertyCoverages = this.coverageService.getCoveragesByCode(quote.coverages, "MD");

		if (!propertyCoverages || propertyCoverages.length === 0) return;

		let coveragePropertyLimits = {
			propertyDamageLimit: null,
			contentsDamageLimit: null,
			stockDamageLimit: null,
			actualLossSustainedLimit: null,
			grossRentalLimit: null,
		} as PropertyLimit;

		propertyCoverages.forEach((propertyCoverage) => {
			coveragePropertyLimits.propertyDamageLimit =
				this.coverageService.getInsuringClauseSectionLimitByCode(propertyCoverage, PropertyLimitCodes.propertyDamageLimit) ??
				coveragePropertyLimits.propertyDamageLimit;

			coveragePropertyLimits.contentsDamageLimit =
				this.coverageService.getInsuringClauseSectionLimitByCode(propertyCoverage, PropertyLimitCodes.contentsDamageLimit) ??
				coveragePropertyLimits.contentsDamageLimit;

			coveragePropertyLimits.stockDamageLimit =
				this.coverageService.getInsuringClauseSectionLimitByCode(propertyCoverage, PropertyLimitCodes.stockDamageLimit) ??
				coveragePropertyLimits.stockDamageLimit;

			coveragePropertyLimits.actualLossSustainedLimit =
				this.coverageService.getInsuringClauseSectionLimitByCode(propertyCoverage, PropertyLimitCodes.actualLossSustainedLimit) ??
				coveragePropertyLimits.actualLossSustainedLimit;

			coveragePropertyLimits.grossRentalLimit = this.getRentalInsuringClauseSectionLimitByCode(propertyCoverage) ?? coveragePropertyLimits.grossRentalLimit;
		});

		coveragePropertyLimits.isPropertyDamageLimitSelected = coveragePropertyLimits.propertyDamageLimit != null ? true : false;
		coveragePropertyLimits.isGrossRentalLimitSelected = coveragePropertyLimits.grossRentalLimit != null ? true : false;
		coveragePropertyLimits.isActualLossSustainedLimitSelected = coveragePropertyLimits.actualLossSustainedLimit != null ? true : false;
		coveragePropertyLimits.isStockDamageLimitSelected = coveragePropertyLimits.stockDamageLimit != null ? true : false;
		coveragePropertyLimits.isContentsDamageLimitSelected = coveragePropertyLimits.contentsDamageLimit != null ? true : false;
		return coveragePropertyLimits;
	}

	private getRentalInsuringClauseSectionLimitByCode(propertyCoverage) {
		let rentalLimit = this.coverageService.getInsuringClauseSectionLimitByCode(propertyCoverage, PropertyLimitCodes.grossRentalLimit);
		if (!rentalLimit) {
			rentalLimit = this.coverageService.getInsuringClauseSectionLimitByCode(propertyCoverage, PropertyLimitCodes.rentalIncomeLimit);
		}
		return rentalLimit;
	}

	private getMultiplePropertyTotalLimits(coveragePropertyLimits: Partial<PropertyLimit>): PropertyLimit {
		const quote = this.quoteService.getQuoteReference();

		if (!quote.propertyLimits || quote.propertyLimits.length === 0) return;

		const propertyLimits = JSON.parse(JSON.stringify(quote.propertyLimits));

		let multiplePropertyLimits = {
			propertyDamageLimit: 0,
			contentsDamageLimit: 0,
			stockDamageLimit: 0,
			actualLossSustainedLimit: 0,
			grossRentalLimit: 0,
			additionalIncreasedCostOfWorkingLimit: 0,
		} as PropertyLimit;

		multiplePropertyLimits = propertyLimits.reduce((totalPropertyLimitValue, currentProperty) => {
			totalPropertyLimitValue.propertyDamageLimit += currentProperty.propertyDamageLimit ?? 0;
			totalPropertyLimitValue.contentsDamageLimit += currentProperty.contentsDamageLimit ?? 0;
			totalPropertyLimitValue.stockDamageLimit += currentProperty.stockDamageLimit ?? 0;
			totalPropertyLimitValue.actualLossSustainedLimit += currentProperty.actualLossSustainedLimit ?? 0;
			totalPropertyLimitValue.grossRentalLimit += currentProperty.grossRentalLimit ?? 0;
			totalPropertyLimitValue.additionalIncreasedCostOfWorkingLimit = this.getAdditionalIncreasedCostOfWorkingLimit(totalPropertyLimitValue, currentProperty);
			return totalPropertyLimitValue;
		});
		this.setSelectedProperties(coveragePropertyLimits, multiplePropertyLimits);

		return multiplePropertyLimits;
	}

	// set selected property limits to the control limit object
	setSelectedProperties(coveragePropertyLimits: Partial<PropertyLimit>, multiplePropertyLimits: PropertyLimit) {
		multiplePropertyLimits.isActualLossSustainedLimitSelected = coveragePropertyLimits.isActualLossSustainedLimitSelected;
		multiplePropertyLimits.isStockDamageLimitSelected = coveragePropertyLimits.isStockDamageLimitSelected;
		multiplePropertyLimits.isContentsDamageLimitSelected = coveragePropertyLimits.isContentsDamageLimitSelected;
		multiplePropertyLimits.isGrossRentalLimitSelected = coveragePropertyLimits.isGrossRentalLimitSelected;
		multiplePropertyLimits.isPropertyDamageLimitSelected = coveragePropertyLimits.isPropertyDamageLimitSelected;
	}

	private getAdditionalIncreasedCostOfWorkingLimit(totalPropertyLimitValue, currentProperty) {
		const totalAdditionalIncreasedCostOfWorkingLimit = isNaN(totalPropertyLimitValue.additionalIncreasedCostOfWorkingLimit)
			? 0
			: totalPropertyLimitValue.additionalIncreasedCostOfWorkingLimit ?? 0;
		const additionalIncreasedCostOfWorkingLimit = isNaN(currentProperty.additionalIncreasedCostOfWorkingLimit)
			? 0
			: currentProperty.additionalIncreasedCostOfWorkingLimit ?? 0;
		return totalAdditionalIncreasedCostOfWorkingLimit + additionalIncreasedCostOfWorkingLimit;
	}

	public validateMatchingLimits(): PropertyLimitMatch {
		const coveragePropertyLimits: Partial<PropertyLimit> = this.getPropertyCoverageLimits();
		const multiplePropertyLimits: Partial<PropertyLimit> = this.getMultiplePropertyTotalLimits(coveragePropertyLimits);

		if (!coveragePropertyLimits) {
			this._limitValidation = { isMatch: false, DivergingLimits: ["Missing Limits, make sure the property coverage has been selected"] };
			return this._limitValidation;
		}

		if (!!multiplePropertyLimits) {
			if (!this.areLimitsEqual(coveragePropertyLimits, multiplePropertyLimits)) {
				this._limitValidation = { isMatch: false, DivergingLimits: this.getDivergingLimits(coveragePropertyLimits, multiplePropertyLimits) };
				return this._limitValidation;
			}
		}

		return (this._limitValidation = { isMatch: true });
	}

	public getPropertyLimitValidation = () => this._limitValidation;

	private areLimitsEqual(coveragePropertyLimits, multiplePropertyLimits): boolean {
		var actualLossSustainedLimit = multiplePropertyLimits.actualLossSustainedLimit ?? 0;
		var additionalIncreasedCostOfWorkingLimit = multiplePropertyLimits.additionalIncreasedCostOfWorkingLimit ?? 0;
		return (
			coveragePropertyLimits.propertyDamageLimit === (multiplePropertyLimits.propertyDamageLimit ?? coveragePropertyLimits.propertyDamageLimit) &&
			coveragePropertyLimits.contentsDamageLimit === (multiplePropertyLimits.contentsDamageLimit ?? coveragePropertyLimits.contentsDamageLimit) &&
			coveragePropertyLimits.stockDamageLimit === (multiplePropertyLimits.stockDamageLimit ?? coveragePropertyLimits.stockDamageLimit) &&
			coveragePropertyLimits.actualLossSustainedLimit === actualLossSustainedLimit + additionalIncreasedCostOfWorkingLimit &&
			coveragePropertyLimits.grossRentalLimit === (multiplePropertyLimits.grossRentalLimit ?? coveragePropertyLimits.grossRentalLimit)
		);
	}

	private getDivergingLimits(coveragePropertyLimits, multiplePropertyLimits) {
		let DivergingLimits = [];
		const quote = this.quoteService.getQuoteReference();
		const propertyCoverages = this.coverageService.getCoveragesByCode(quote.coverages, "MD");

		if (!!coveragePropertyLimits && !!multiplePropertyLimits) {
			if (
				coveragePropertyLimits.isContentsDamageLimitSelected &&
				this.isLimitDiverging(coveragePropertyLimits, multiplePropertyLimits, "contentsDamageLimit")
			) {
				DivergingLimits.push(this.coverageService.getInsuringClauseSectionLimitNameByCode(propertyCoverages, PropertyLimitCodes["contentsDamageLimit"]));
			}

			if (
				coveragePropertyLimits.isPropertyDamageLimitSelected &&
				this.isLimitDiverging(coveragePropertyLimits, multiplePropertyLimits, "propertyDamageLimit")
			) {
				DivergingLimits.push(this.coverageService.getInsuringClauseSectionLimitNameByCode(propertyCoverages, PropertyLimitCodes["propertyDamageLimit"]));
			}

			if (coveragePropertyLimits.isStockDamageLimitSelected && this.isLimitDiverging(coveragePropertyLimits, multiplePropertyLimits, "stockDamageLimit")) {
				DivergingLimits.push(this.coverageService.getInsuringClauseSectionLimitNameByCode(propertyCoverages, PropertyLimitCodes["stockDamageLimit"]));
			}

			if (
				coveragePropertyLimits.isActualLossSustainedLimitSelected &&
				this.isLimitDiverging(coveragePropertyLimits, multiplePropertyLimits, "actualLossSustainedLimit")
			) {
				DivergingLimits.push(this.coverageService.getInsuringClauseSectionLimitNameByCode(propertyCoverages, PropertyLimitCodes["actualLossSustainedLimit"]));
			}

			if (coveragePropertyLimits.isGrossRentalLimitSelected && this.isLimitDiverging(coveragePropertyLimits, multiplePropertyLimits, "grossRentalLimit")) {
				DivergingLimits.push(this.coverageService.getInsuringClauseSectionLimitNameByCode(propertyCoverages, PropertyLimitCodes["grossRentalLimit"]));
			}
		} else {
			DivergingLimits.push("Missing Limits, make sure the property coverage has been selected");
		}
		return DivergingLimits;
	}

	private isLimitDiverging(coveragePropertyLimits, multiplePropertyLimits, key): boolean {
		const additionalIncreasedCostOfWorkingLimit = isNaN(multiplePropertyLimits["additionalIncreasedCostOfWorkingLimit"])
			? 0
			: multiplePropertyLimits["additionalIncreasedCostOfWorkingLimit"];
		const propertyLimit =
			key === "actualLossSustainedLimit" ? multiplePropertyLimits[key] + additionalIncreasedCostOfWorkingLimit : multiplePropertyLimits[key];
		return coveragePropertyLimits[key] !== propertyLimit;
	}
}

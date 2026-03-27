import { CommonModule, DecimalPipe } from "@angular/common";
import { ChangeDetectorRef, Injectable } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, flush } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule, By } from "@angular/platform-browser";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import {
    CoverageLimit,
    CoverageLimitType,
    Currency,
    UnderwriterRoleLimitValidationRule
} from "@app/models";
import { Coverage } from "@app/models/auto-generated/Coverage";
import { CoverageType } from "@app/models/auto-generated/CoverageType";
import { Tag } from "@app/quote/models/pricing/Tag";
import { LeadLimitConfiguration } from "@app/models/extendedModels/LeadLimitConfiguration";
import { LimitComponent } from "@app/quote/components/coverage/limit/limit.component";
import { LimitRuleFilter } from "@app/quote/view-models/LimitRuleFilter";
import { DictionaryHelperService } from "@app/services/dictionary-helper.service";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { CoverageCalculationService } from "@app/services/coverage-calculation.service";
import { ErrorModule } from "@app/shared/error.module";
import { CoverageService } from '@app/services/coverage.service';
import { LimitBasis } from '@app/enums/LimitBasis';


@Injectable()
class MockCoverageService{
    totalInsuredValue = 1000000;
    firstLossLimitValue = 1000000;
}

describe("limit component", () => {
    let component: LimitComponent;
    let fixture: ComponentFixture<LimitComponent>;
    let currency: Currency = {
        id: 1,
        symbol: "£",
        isoCode: "GBP",
        name: "pound",
        rate: 1.0
    };
    let isBoundPolicy: boolean;
    let underwriterCoverageAuthorityService: UnderwriterCoverageAuthorityService;
    let coverageService:CoverageService;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                LimitComponent,
                CurrencyComponent,
                LargeNumberMask
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                CommonModule,
                ErrorModule
            ],
            providers: [
                ChangeDetectorRef,
                MockCoverageAuthorityService,
                CoverageCalculationService,
                CoverageLimit,
                CoverageLimitType,
                FormBuilder,
                DictionaryHelperService,
                DecimalPipe,
                { provide: UnderwriterCoverageAuthorityService, useClass: MockCoverageAuthorityService },
                { provide: CoverageService, useClass: MockCoverageService }
            ]
        }).compileComponents();
        underwriterCoverageAuthorityService = TestBed.inject(UnderwriterCoverageAuthorityService);
        coverageService = TestBed.inject(CoverageService);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LimitComponent);
        component = fixture.componentInstance;
        component.limit = getCoverageLimit();
        component.currency = currency;
        component.hasWarning = false;
        component.warningMessage = "";
        component.coverageType = new CoverageType();
        component.coverageType.businessLine = new Tag();
        component.coverageType.businessLine.name = "DO";
        component.coverageType.insuringClauseCode = new Tag();
        component.coverageType.insuringClauseCode.name = "DOIM";
        component.coverageType.insuringClauseSectionCode = new Tag();
        component.coverageType.insuringClauseSectionCode.name = "DOIMFC";
        isBoundPolicy = false;
        fixture.detectChanges();
    });

    it("should create component", fakeAsync(() => {
        expect(component).toBeTruthy();
    }));

    it("all values are compulsory when selected", fakeAsync(() => {
        component.isSelected = true;
        fixture.detectChanges();
        expect(component.form.get("costBasis").valid).toBe(false);
        expect(component.form.get("limitBasis").valid).toBe(false);
        expect(component.limitvalue.isValid()).toBe(false);
        flush();
    }));

    it("no values are compulsory when not selected", fakeAsync(() => {
        component.isSelected = false;
        fixture.detectChanges();
        expect(component.form.get("costBasis").valid).toBe(true);
        expect(component.form.get("limitBasis").valid).toBe(true);
        expect(component.limitvalue.isValid()).toBe(true);
        flush();
    }));

    it("no errors if all values complete", fakeAsync(() => {
        fixture.detectChanges();
        component.form.get("limitBasis").setValue(1);
        component.form.get("costBasis").setValue(1);
        component.limitvalue.control.setValue(1);

        fixture.detectChanges();

        expect(component.form.get("costBasis").valid).toBe(true);
        expect(component.form.get("limitBasis").valid).toBe(true);
        expect(component.limitvalue.isValid()).toBe(true);
        expect(component.isValid()).toBe(true);
        flush();
    }));

    it("should accept Lead values when the defaults and current values are the same for leaders and follower", fakeAsync(() => {
        fixture.detectChanges();

        component.limit.limit = 1;
        component.limit.limitBasis = 2;
        component.limit.costBasis = 3;

        component.leadLimitConfiguration = getLeadLimitConfiguration(component.limit);

        component.leadLimitValue = 4;
        component.leadLimitBasis = 5;
        component.leadLimitCostBasis = 6;

        expect(component.limit.limit).toBe(4);
        expect(component.limit.limitBasis).toBe(5);
        expect(component.limit.costBasis).toBe(6);
        flush();
    }));

    it("should NOT accept Lead values when value is different from the leader", fakeAsync(() => {
        fixture.detectChanges();
        const config = getLeadLimitConfiguration(component.limit);
        config.leaders[0].limit = 1;
        config.leaders[0].limitBasis = 2;
        config.leaders[0].costBasis = 3;

        component.leadLimitConfiguration = config;

        component.limit.limit = 5;
        component.limit.limitBasis = 5;
        component.limit.costBasis = 5;

        component.leadLimitValue = 6;
        component.leadLimitBasis = 7;
        component.leadLimitCostBasis = 8;

        expect(component.limit.limit).toBe(5);
        expect(component.limit.limitBasis).toBe(5);
        expect(component.limit.costBasis).toBe(5);
        flush();
    }));

    it("should NOT accept Lead values when value is the same as the leader but the defaults are different", fakeAsync(() => {
        fixture.detectChanges();

        component.limit.limit = 1;
        component.limit.limitBasis = 2;
        component.limit.costBasis = 3;

        const config = getLeadLimitConfiguration(component.limit);
        config.leaders[0].limit = 8;
        config.leaders[0].limitBasis = 8;
        config.leaders[0].costBasis = 8;

        component.leadLimitConfiguration = config;

        component.leadLimitValue = 4;
        component.leadLimitBasis = 5;
        component.leadLimitCostBasis = 6;

        expect(component.limit.limit).toBe(1);
        expect(component.limit.limitBasis).toBe(2);
        expect(component.limit.costBasis).toBe(3);
        flush();
    }));

    it("should still follow when has a factor and reach 0", fakeAsync(() => {
        fixture.detectChanges();
        const defaultLeadValue = 100000;
        const factor = 0.1;

        component.limit.coverageLimitType.defaultLimit = defaultLeadValue * factor;
        component.limit.limit = 10000;

        const config = getLeadLimitConfiguration(component.limit);

        config.multiplicationFactor = factor;
        config.leaders[0].coverageLimitType.defaultLimit = defaultLeadValue;
        config.leaders[0].limit = 100000;

        component.leadLimitConfiguration = config;

        component.leadLimitValue = defaultLeadValue;
        component.leadLimitValue = 0;
        component.leadLimitValue = 60;

        expect(component.limit.limit).toBe(6);
        flush();
    }));

    it("should have a limit value of half the lead limit when the multiplication factor is 0.5", fakeAsync(() => {
        fixture.detectChanges();
        component.limit.limit = 20;
        component.limit.coverageLimitType.defaultLimit = 20;

        const leadLimit = getCoverageLimit();
        leadLimit.limit = 40;
        leadLimit.coverageLimitType.defaultLimit = 40;

        const config = getLeadLimitConfiguration(leadLimit);
        config.multiplicationFactor = 0.5;
        config.leaders[0].coverageLimitType.defaultLimit = 40;

        component.leadLimitConfiguration = config;

        component.leadLimitValue = 100;

        expect(component.limit.limit).toBe(50);
        flush();
    }));

    it("should have a limit value of double the lead limit when the multiplication factor is 2", fakeAsync(() => {
        fixture.detectChanges();
        component.limit.limit = 80;
        component.limit.coverageLimitType.defaultLimit = 80;

        const leadLimit = getCoverageLimit();
        leadLimit.limit = 40;
        leadLimit.coverageLimitType.defaultLimit = 40;

        const config = getLeadLimitConfiguration(leadLimit);
        config.multiplicationFactor = 2;
        config.leaders[0].coverageLimitType.defaultLimit = 40;

        component.leadLimitConfiguration = config;

        component.leadLimitValue = 100;

        expect(component.limit.limit).toBe(200);
        flush();
    }));

    it("when limitCoverageType 'isHidden' is true, none of the inputs should be visible.", fakeAsync(() => {
        fixture.detectChanges();
        let limitEl = fixture.debugElement.query(By.css(".limit.row")).nativeElement;
        expect(limitEl).toBeDefined();
        expect(limitEl).not.toBeNull();
        expect(limitEl.hidden).toBe(false);

        component.limit.coverageLimitType.isHidden = true;
        fixture.detectChanges();

        limitEl = fixture.debugElement.query(By.css(".limit.row")).nativeElement;
        expect(limitEl).toBeDefined();
        expect(limitEl).not.toBeNull();
        expect(limitEl.hidden).toBe(true);
    }));

    describe("limit cap is applied", () => {
        it("should obey cap when limit is changed to a value greater than the cap", fakeAsync(() => {
            fixture.detectChanges();
            const cap = 200000;

            var limit = getCoverageLimit();
            limit.coverageLimitType.cap = cap;
            component.limit = limit;

            limit.limit = 250000;
            component.limit = limit;

            expect(component.limit.limit).toBe(200000);
            flush();
        }));

        it("should obey cap when lead limit is changed to a greater value", fakeAsync(() => {
            fixture.detectChanges();
            let limit = getCoverageLimit();
            limit.limit = 100000;
            limit.coverageLimitType.defaultLimit = 100000;
            limit.coverageLimitType.cap = 200000;
            component.limit = limit;

            const leadLimit = getCoverageLimit();
            leadLimit.coverageLimitType.defaultLimit = 100000;

            const config = getLeadLimitConfiguration(leadLimit);
            component.leadLimitConfiguration = config;

            expect(component.limit.limit).toBe(100000);

            component.leadLimitValue = 2500000;

            expect(component.limit.limit).toBe(200000);
            flush()
        }));

        it("should obey cap but resume following when lead limit returns to value below cap", fakeAsync(() => {
            fixture.detectChanges();
            component.limit.limit = 100000;
            component.limit.coverageLimitType.defaultLimit = 100000;
            component.limit.coverageLimitType.cap = 200000;

            const leadLimit = getCoverageLimit();
            leadLimit.coverageLimitType.defaultLimit = 100000;

            const config = getLeadLimitConfiguration(leadLimit);
            component.leadLimitConfiguration = config;

            component.leadLimitValue = 250000;

            expect(component.limit.limit).toBe(200000);

            component.leadLimitValue = 125000;

            expect(component.limit.limit).toBe(125000);
            flush();
        }));
    });

    describe("underwriter authority check", () => {
        it("should not return a warning if the limit is not selected", fakeAsync(() => {
            // Arrange
            component.hasWarning = true;
            component.limitvalue.value = 1000000000;
            component.limit.limit = 1000000000;
            component.isSelected = false;

            // Assert
            expect(component.hasWarning).toBe(false);
            flush();
        }));

        it("should not return a warning if limit is invalid", fakeAsync(() => {
            // Arrange
            component.hasWarning = true;
            component.isSelected = true;

            // Assert
            expect(component.hasWarning).toBe(false);
            flush();
        }));

        it("should not return a warning if approved quote", fakeAsync(() => {
            // Arrange
            isBoundPolicy = true;
            component.hasWarning = true;
            component.limitvalue.value = 1000000000;
            component.limit.limit = 1000000000;
            component.isSelected = true;

            // Assert
            expect(component.hasWarning).toBe(false);
            flush();
        }));

        it("should return a warning if the limit is valid and selected, the quote is not approved and there's no valid limit authority", fakeAsync(() => {
            // Arrange
            spyOn(underwriterCoverageAuthorityService, "hasValidLimitAuthority").and.returnValue(false);
            component.hasWarning = false;
            component.limitvalue.value = 1000000000;
            component.limit.limit = 1000000000;
            component.isSelected = true;

            // Assert
            expect(component.hasWarning).toBe(true);
            flush();
        }));

        it("should display a warning if the user doesn't have authority (no roles)", fakeAsync(() => {
            // Arrange
            spyOn(underwriterCoverageAuthorityService, "hasValidLimitAuthority").and.returnValue(false);
            spyOn(underwriterCoverageAuthorityService, "getLimitAuthorityRuleByFilters").and.returnValue(null);
            component.hasWarning = false;
            component.limitvalue.value = 1000000000;
            component.limit.limit = 1000000000;
            component.isSelected = true;

            // Assert
            expect(component.hasWarning).toBeTruthy();
            expect(component.warningMessage).toBe("No underwriter authority");
            flush();
        }));
    });

    describe("Check update total insured limit value and limit field readonly property", () => {
        it("should show total insured limit value on limit field when limit type is total insured limit", () => {
            // Arrange
            component.limit.limitBasis = LimitBasis.TotalInsuredValue;
            component.limit.limit = 1;
            component.isTotalInsuredLimitTypeCode = true;
            coverageService.totalInsuredLimitValue = 1000000;

            // Act
            component.updateTotalInsuredLimitValue();

            // Assert
            expect(component.limit.limit).toBe(1000000);
        });

        it("should NOT show total insured limit value on limit field when limit type is not total insured limit", () => {
            // Arrange
            component.limit.limitBasis = LimitBasis.TotalInsuredValue;
            component.isTotalInsuredLimitTypeCode = false;
            component.limit.limit = 1;

            // Act
            component.updateTotalInsuredLimitValue();

            // Assert
            expect(component.limit.limit).toBe(1);
        });

        it("should make limit field readonly when limit type is total insured limit", () => {
            // Arrange
            component.limit.limitBasis = LimitBasis.TotalInsuredValue;
            component.isTotalInsuredLimitTypeCode = true;

            // Act
            component.updateTotalInsuredLimitValue();

            // Assert
            expect(component.limitReadOnly).toBe(true);
        });

        it("should NOT make limit field readonly when limit type is NOT total insured limit", () => {
            // Arrange
            component.limit.limitBasis = LimitBasis.TotalInsuredValue;
            component.isTotalInsuredLimitTypeCode = false;

            // Act
            component.updateTotalInsuredLimitValue();

            // Assert
            expect(component.limitReadOnly).toBe(false);
        });
    });

    function getCoverageLimit(): CoverageLimit {
        const covLimit = new CoverageLimit();
        covLimit.limitTypeId = 1;
        covLimit.limit = null;
        covLimit.limitBasis = null;
        covLimit.costBasis = null;
        covLimit.coverageLimitType = getCoverageLimitType();
        return covLimit;
    }

    function getCoverageLimitType(): CoverageLimitType {
        const limitType = new CoverageLimitType();
        limitType.limitTypeId = 1;
        limitType.limitTypeCode = "DOIMFCL1";
        limitType.defaultLimit = 1;
        limitType.defaultLimitBasis = 2;
        limitType.defaultCostBasis = 3;

        limitType.availableLimitBasis = [];
        limitType.availableLimitBasis[1] = "Any one claim";
        limitType.availableLimitBasis[2] = "Maximum per day";
        limitType.availableLimitBasis[3] = "Annual aggregate";

        limitType.availableCostBasis = [];
        limitType.availableCostBasis[1] = "Cost Inclusive";
        limitType.availableCostBasis[2] = "Costs in Addition, Unlimited";
        limitType.availableCostBasis[3] = "Costs in Addition, Capped at Limit";
        limitType.availableCostBasis[4] = "Costs in Addition, Capped at lower of 1m or limit";
        limitType.availableCostBasis[5] = "Cost in Addition, Capped at 10%";
        return limitType;
    }

    function getLeadLimitConfiguration(coverageLimit: CoverageLimit): LeadLimitConfiguration {
        const leadLimit = new CoverageLimit();
        leadLimit.limit = coverageLimit.coverageLimitType.defaultLimit;
        leadLimit.limitBasis = coverageLimit.coverageLimitType.defaultLimitBasis;
        leadLimit.costBasis = coverageLimit.coverageLimitType.defaultCostBasis;
        leadLimit.coverageLimitType = new CoverageLimitType();
        leadLimit.coverageLimitType.defaultLimit = leadLimit.limit;
        leadLimit.coverageLimitType.defaultLimitBasis = leadLimit.limitBasis;
        leadLimit.coverageLimitType.defaultCostBasis = leadLimit.costBasis;
        return new LeadLimitConfiguration([leadLimit], 1);
    }

    function getUnderwriterRoleLimitValidationRule() {
        const underwriterRoleLimitValidationRule = new UnderwriterRoleLimitValidationRule();
        underwriterRoleLimitValidationRule.businessLineCode = "DO";
        underwriterRoleLimitValidationRule.insuringClauseCode = "DOIM";
        underwriterRoleLimitValidationRule.insuringClauseSectionCode = "DOIMFC";
        underwriterRoleLimitValidationRule.limitTypeCode = "DOIMFCL1";
        underwriterRoleLimitValidationRule.minLimit = 1;
        underwriterRoleLimitValidationRule.maxLimit = 1000000;
        underwriterRoleLimitValidationRule.currencyIsoCode = "GBP";
        return underwriterRoleLimitValidationRule;
    }

    @Injectable()
    class MockCoverageAuthorityService {
        public isBoundQuote = () => isBoundPolicy;
        public isApprovedQuote = () => isBoundPolicy;
        public setWarningStatus = (key: string, hasWarningStatus: boolean) => "";
        public getLimitAuthorityRuleFilter = (
            businessLine: string,
            insuringClauseCode: string,
            insuringClauseSectionCode: string,
            limitCode: string,
            currency: Currency) => new LimitRuleFilter();
        public hasValidLimitAuthority = (limit: CoverageLimit, limitRuleFilter: LimitRuleFilter) => true;
        public hasValidCoveragesLimitAuthority = (coverages: Coverage[]) => true;
        public getLimitAuthorityRuleByFilters = (filters: LimitRuleFilter) => getUnderwriterRoleLimitValidationRule();
    }
});

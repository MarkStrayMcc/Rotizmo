import { async, inject, TestBed } from "@angular/core/testing";
import { DateSorterService } from "@app/services/date-sorter.service";

describe("DateSorterService", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DateSorterService
            ]
        }).compileComponents();
    }));

    it("Should sort two dates by year correctly", () => {
        // Arrange
        // Act
        let result = DateSorterService.compareDates("09/09/2010", "09/09/2070");

        // Assert first date is before second
        expect(result).toBeLessThan(0);
    });

    it("Should sort two dates by month correctly", () => {
        // Arrange
        // Act
        let result = DateSorterService.compareDates("09/09/2010", "09/12/2010");

        // Assert first date is before second
        expect(result).toBeLessThan(0);
    });

    it("Should sort two dates by day correctly", () => {
        // Arrange
        // Act
        let result = DateSorterService.compareDates("13/09/2010", "19/09/2010");

        // Assert first date is before second
        expect(result).toBeLessThan(0);
    });

    it("Should sort two dates by month correctly reverse", () => {
        // Arrange
        // Act
        let result = DateSorterService.compareDates("09/09/2010", "09/03/2010");

        // Assert first date is before second
        expect(result).toBeGreaterThan(0);
    });
});
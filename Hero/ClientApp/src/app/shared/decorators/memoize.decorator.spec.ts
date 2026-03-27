import { Memoize } from "./memoize.decorator";

describe("Memoize", () => {
    const memoize  = Memoize();

    it("should cache function results based on parameters", () => {
        // Arrange
        let count = 0;

        const descriptor = { value: (int: number) => { count += int } }; 
        const int1 = 15;
        const int2 = 340;

        memoize(null, null, descriptor);

        // Act
        descriptor.value(int1);
        descriptor.value(int1);
        descriptor.value(int2);
        descriptor.value(int2);
        descriptor.value(int2);

        // Assert
        expect(count).toBe(int1 + int2);
    });

    it("should cache function results based on multiple parameters", () => {
        // Arrange
        let count = 0;

        const descriptor = { value: (int1: number, int2: number) => { count += int1 + int2 } }; 
        const int1 = 15;
        const int2 = 340;

        memoize(null, null, descriptor);

        // Act
        descriptor.value(int1, int2);
        descriptor.value(int1, int2);
        descriptor.value(int2, int1);

        // Assert
        expect(count).toBe((int1 * 2) + (int2 * 2));
    });
});

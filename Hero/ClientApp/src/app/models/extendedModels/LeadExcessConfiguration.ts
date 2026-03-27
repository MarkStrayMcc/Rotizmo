import { CoverageExcess } from "@app/models";

export class LeadExcessConfiguration {
    public constructor(
        public leaders: CoverageExcess[],
        public multiplicationFactor: number
    ) {
    }
}

import { CoverageLimit } from "@app/models";

export class LeadLimitConfiguration {
    public constructor(
        public leaders: CoverageLimit[],
        public multiplicationFactor: number
    ) {
    }
}

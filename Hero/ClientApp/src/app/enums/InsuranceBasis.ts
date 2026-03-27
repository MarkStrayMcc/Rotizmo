export enum InsuranceBasis {
    Primary = 1,
    Excess = 2
    //PrimaryAndExcess = 3 not yet supported
}

export const InsuranceBasisDescriptions: { [key in InsuranceBasis]: string } = {
    [InsuranceBasis.Primary]: "Primary",
    [InsuranceBasis.Excess]: "Excess"
};

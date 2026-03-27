import { CfcContact } from "@app/models/auto-generated";
import { mockRoles } from "./underwriter-roles.mock";
import { mockAccessibleFeatures } from "./accessible-features.mock";

export const mockCfcContact: CfcContact = {
    cfcContactId: 589,
    cfcContactUid: "1dc86388-2e78-4caf-ab73-be46d9ae6749",
    firstName: "Rodrigo",
    lastName: "Fante",
    initials: "RDF",
    email: "rFante@cfcunderwriting.com",
    active: true,
    name: "Rodrigo Fante",
    cfcTeamName: "-",
    accessLevel: 10,
    profileImageUrl: "img/staff/empty_profile.png",
    position: null,
    linkedInUrl: null,
    telephone: null,
    roles:  mockRoles,
    accessibleFeatures: mockAccessibleFeatures,
    cfcTeamCoverholder: "CFC Underwriting",
};

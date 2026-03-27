import { BrokerTeam } from "@app/quote/models/Brokers/BrokerTeam";
import { BrokerCompany } from "@app/quote/models/Brokers/BrokerCompany";
import { BrokerContact } from "@app/quote/models/Brokers/BrokerContact";
import { BrokerGroup } from "@app/quote/models/Brokers/BrokerGroup";

export class BrokerInformationResponse {
    public brokerTeam: BrokerTeam;
    public brokerCompany: BrokerCompany;
    public brokerGroup: BrokerGroup;
    public brokerContact: BrokerContact;
}

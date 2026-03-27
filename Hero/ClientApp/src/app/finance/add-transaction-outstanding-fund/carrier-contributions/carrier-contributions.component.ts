import { Component, Input } from "@angular/core";
import { CarrierContribution } from "@app/services/finance/add-transaction-modal/models/CarrierContribution";

@Component({
  selector: "carrier-contributions",
  templateUrl: "./carrier-contributions.component.html",
  styleUrls: ["./carrier-contributions.component.scss"]
})
export class CarrierContributionsComponent {
    @Input() carrierContributions: CarrierContribution[];
}

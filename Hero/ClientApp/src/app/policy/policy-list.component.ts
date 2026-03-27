import { Component, Input, OnInit } from "@angular/core";
import { Policy } from "@app/models/auto-generated/Policy";
import { MtaSelectionType } from "./mta/mta-selection.config";

@Component({
  selector: "policy-list",
  templateUrl: "./policy-list.component.html",
  styleUrls: ["./policy-list.component.scss"]
})
export class PolicyListComponent {

  @Input()
  public mtaSelectionTypes: MtaSelectionType[];

  @Input()
  public policies: Policy[];

}

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Policy } from "@app/models/auto-generated/Policy";
import { MtaService } from "@app/policy/services/mta.service";
import { PolicyHttpService } from "@app/services/policy-http.service";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MtaSelectionType } from "./mta/mta-selection.config";

@Component({
    selector: "policy-search",
    templateUrl: "./policy-search.component.html",
    styleUrls: ["./policy-search.component.scss"]
})
export class PolicySearchComponent implements OnInit {

    public mtaSelectionTypes: MtaSelectionType[];
    public policies: Policy[];
    public form: FormGroup;
    public searchControl: FormControl;

    constructor(private policyService: PolicyHttpService, private mtaService: MtaService, private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            search: ['']
        });

        this.searchControl = this.form.get('search') as FormControl;

        this.mtaService.getAllAvailableMtaOptions().subscribe((result: MtaSelectionType[]) => {
            if (result) {
                this.mtaSelectionTypes = result;
            }
        });

        this.form.valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe(() => {
            const searchParams = this.form.get('search').value;
            if (searchParams === "" || searchParams == null) {
                this.policies = null;
            } else {
                this.policyService.getPolicySearchResults(searchParams).subscribe((result: Policy[]) => {
                    if (result) {
                        this.policies = result;
                    }
                });
            }
        });
    }
}

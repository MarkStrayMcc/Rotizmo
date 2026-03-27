import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MtaLossPayeeComponent } from "@app/policy/mta/popups/loss-payee/mta-loss-payee.component";
import { PolicyHttpService } from "@app/services/policy-http.service";
import { ErrorModule } from "@app/shared/error.module";
import { FormCreatorModule } from "@app/shared/form-creator/form-creator.module";
import { ModalsModule } from "@app/shared/modals/modals.module";
import { SharedModule } from "@app/shared/shared.module";
import { MtaAdditionalInsuredComponent } from "./additional-insured/mta-additional-insured.component";
import { MtaAddressChangeComponent } from "./address-change/mta-address-change.component";
import { MtaAbInitioCancellationComponent } from "./mta-ab-initio-cancellation/mta-ab-initio-cancellation.component";
import { MtaClientNameChangeComponent } from "./client-name-change/mta-client-name-change.component";
import { MtaManualChangeMtaComponent } from "./manual-mta/mta-manual-mta.component";
import { MtaSendEmailComponent } from "./send-email/mta-send-email.component";
import { MtaCancellationComponent } from "./cancellation/cancellation.component";
import {MtaConfirmationComponent} from "@app/policy/mta/popups/confirmation/confirmation.component";

@NgModule({
    declarations: [
        MtaAdditionalInsuredComponent,
        MtaAddressChangeComponent,
        MtaClientNameChangeComponent,
        MtaLossPayeeComponent,
        MtaAbInitioCancellationComponent,
        MtaSendEmailComponent,
        MtaManualChangeMtaComponent,
        MtaCancellationComponent,
        MtaConfirmationComponent
    ],
    providers: [
        PolicyHttpService
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        FormCreatorModule,
        ModalsModule,
        ErrorModule,
        SharedModule
    ],
    exports: [
        MtaAdditionalInsuredComponent,
        MtaAddressChangeComponent,
        MtaClientNameChangeComponent,
        MtaLossPayeeComponent,
        MtaAbInitioCancellationComponent,
        MtaManualChangeMtaComponent,
        MtaSendEmailComponent,
        FormCreatorModule,
        ModalsModule
    ]
})

export class PopupsModule { }

import { CommonModule, DecimalPipe } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { LOCALE_ID, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { AutocompleteMultiselectComponent } from "@app/components/autocomplete-multiselect/autocomplete-multiselect.component";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { DatepickerHeader } from "@app/components/datepicker-header/datepicker-header.component";
import { Datepicker } from "@app/components/datepicker/datepicker.component";
import { DialogComponent } from "@app/components/dialog/dialog.component";
import { InputFileComponent } from "@app/components/input-file/input-file.component";
import { LoadingSpinnerComponent } from "@app/components/loading-spinner/loading-spinner";
import { LoadingComponent } from "@app/components/loading/loading.component";
import { MessageComponent } from "@app/components/message/message.component";
import { PercentageInputComponent } from "@app/components/percentage-input/percentage-input.component";
import { SkipToComponent } from "@app/components/skip-to/skip-to.component";
import { CurrencySliderComponent } from "@app/components/slider/currency-slider.component";
import { TagInputComponent } from "@app/components/tag-input/tag-input.component";
import { DateOnly } from "@app/directives/date-only.directive";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { NumberMaskDirective } from "@app/directives/number-mask.directive";
import { NumberOnly } from "@app/directives/number-only.directive";
import { UppercaseDirective } from "@app/directives/uppercase.directive";
import { MaterialModule } from "@app/material/material.module";
import { AbsPipe } from "@app/pipes/abs.pipe";
import { AccountsFormatPipe } from "@app/pipes/accounts-format.pipe";
import { ValueArrayPipe } from "@app/pipes/value-array.pipe.service";
import { MomentDateAdapter, MOMENT_DATE_FORMATS } from "@app/providers/momentDateAdapter";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DateSorterService } from "@app/services/date-sorter.service";
import { DictionaryHelperService } from "@app/services/dictionary-helper.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { FileUploadService } from "@app/services/file-upload-service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { AdditionalInsuredConfigBuilder } from "@app/shared/additional-insured/additional-insured.config-builder";
import { ErrorModule } from "@app/shared/error.module";
import { MaximumFeeAsyncValidator } from "@app/validators/maximum-fee-async.validator";
import { NouisliderModule } from "ng2-nouislider";
import { FieldMessageComponent } from "./components/alert/message/field-message.component";
import { LossPayeeConfigBuilder } from "./loss-payee/loss-payee.config-builder";
import { DropDownFieldService } from "./services/dropdown-field.service";
import { FormCreatorService } from "./services/form-creator.service";
import { ToastrService } from "./toastr/toastr.service";
import { ToastrComponent } from "./toastr/toastr.component";
import { DndDirective } from "@app/directives/drag-drop.directive";
import { InformationBoxComponent } from "./information-box/information-box.component";
import { ThousandSuffixesPipe } from '@app/pipes/thousands-suffix.pipe';

@NgModule({
	declarations: [
		NumberOnly,
		DateOnly,
		LargeNumberMask,
		NumberMaskDirective,
		UppercaseDirective,
		AutocompleteDropdown,
		MessageComponent,
		Datepicker,
		DatepickerHeader,
		DialogComponent,
		CurrencyComponent,
		PercentageInputComponent,
		InputFileComponent,
		SkipToComponent,
		AbsPipe,
		AccountsFormatPipe,
		ValueArrayPipe,
        ThousandSuffixesPipe,
		TagInputComponent,
		CurrencySliderComponent,
		LoadingSpinnerComponent,
		LoadingComponent,
		AutocompleteMultiselectComponent,
		MaximumFeeAsyncValidator,
		FieldMessageComponent,
		ToastrComponent,
		InformationBoxComponent,
		DndDirective,
	],
	providers: [
		{ provide: LOCALE_ID, useValue: "en-GB" },
		{ provide: DateAdapter, useClass: MomentDateAdapter },
		{ provide: MAT_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS },
		MaximumFeeAsyncValidator,
		MessageService,
		FormCreatorService,
		DropDownFieldService,
		ErrorMessageHandlerService,
		ModalDialogService,
		DecimalPipe,
		DictionaryHelperService,
		CurrencyHttpService,
		DateSorterService,
		FileUploadService,
		AdditionalInsuredConfigBuilder,
		LossPayeeConfigBuilder,
		ToastrService,
	],
	imports: [FormsModule, ReactiveFormsModule, MaterialModule, HttpClientModule, CommonModule, ErrorModule, NouisliderModule],
	exports: [
		NumberOnly,
		NumberMaskDirective,
		UppercaseDirective,
		DateOnly,
		LargeNumberMask,
		AutocompleteDropdown,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		HttpClientModule,
		MessageComponent,
		Datepicker,
		DatepickerHeader,
		CurrencyComponent,
		PercentageInputComponent,
		InputFileComponent,
		SkipToComponent,
		AbsPipe,
		AccountsFormatPipe,
        ThousandSuffixesPipe,
		ValueArrayPipe,
		TagInputComponent,
		CurrencySliderComponent,
		LoadingSpinnerComponent,
		LoadingComponent,
		AutocompleteMultiselectComponent,
		FieldMessageComponent,
		ToastrComponent,
		InformationBoxComponent,
		DndDirective,
	],
})
export class SharedModule {}

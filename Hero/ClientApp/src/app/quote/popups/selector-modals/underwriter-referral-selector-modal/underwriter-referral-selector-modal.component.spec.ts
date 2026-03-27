/// <reference path="../../../../../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { UnderwriterReferralSelectorModal } from '@app/quote/popups/selector-modals/underwriter-referral-selector-modal/underwriter-referral-selector-modal.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DropdownService } from "@app/services/dropdown.service";
import { of } from "rxjs";
import { ErrorModule } from "@app/shared/error.module";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { MaterialModule } from '@app/material/material.module';
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReferralService } from "@app/services/referral.service";
import { UserService } from "@app/services/user.service";
import { CookieService } from 'ngx-cookie-service';
import { Component } from '@angular/core';

describe('underwriter-referral-selector-modal component',
    () => {

        let component: UnderwriterReferralSelectorModal;
        let fixture: ComponentFixture<UnderwriterReferralSelectorModal>;
        let matDialogRef: MatDialogRef<UnderwriterReferralSelectorModal>;
        let dropDownService: DropdownService;
        
        class MockMatDialogRef<T> {
            public close(dialogResult?: any): void { return; }
        }

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    UnderwriterReferralSelectorModal,
                    AutocompleteDropdown,
                    MockLoadingSpinnerComponent
                ],
                imports: [
                    BrowserModule,
                    FormsModule,
                    ReactiveFormsModule,
                    MatDialogModule,
                    ErrorModule,
                    MaterialModule,
                    HttpClientTestingModule,
                    BrowserAnimationsModule

                ],
                providers: [
                    { provide: MatDialogRef, useClass: MockMatDialogRef },
                    FormBuilder,
                    DropdownService,
                    ReferralService,
                    UserService,
                    CookieService
                ]
            }).compileComponents().then(() => {

                fixture = TestBed.createComponent(UnderwriterReferralSelectorModal);
                component = fixture.componentInstance;
                matDialogRef = TestBed.inject(MatDialogRef);

                dropDownService = fixture.debugElement.injector.get(DropdownService);
                spyOn(dropDownService, "getUnderwritersForReferral").and.returnValue(of(
                    [
                        {
                            firstName: "Leon",
                            lastName: "Schiedermair"
                        },
                        {
                            firstName: "Noel",
                            lastName: "Riamredeihcs"
                        }
                    ]
                ));
            });
        }));

        it("Should create component",
            () => {
                expect(component).toBeDefined();
            });

        it("Confirm button should be disabled when component is rendered",
            () => {
                fixture.detectChanges();
                const confirmButton = fixture.debugElement.query(By.css(".btn-primary")).nativeElement;
                expect(confirmButton.disabled).toBeTruthy();
            });

        it("Should call dropdownservice when component is initialised",
            () => {
                fixture.detectChanges();
                expect(dropDownService.getUnderwritersForReferral).toHaveBeenCalledWith(component.quoteId);
            });
    });


@Component({ selector: "loading-spinner", template: "" })
class MockLoadingSpinnerComponent {}

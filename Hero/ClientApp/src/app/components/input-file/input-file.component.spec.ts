import { ReactiveFormsModule, FormsModule, NG_VALUE_ACCESSOR, NgControl, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { InputFileComponent } from "./input-file.component";
import { FileInput } from "@app/components/input-file/file-input.model";
import { ServerSideFileData } from "@app/models";

describe("InputFileComponent",
    () => {
        let component: InputFileComponent;
        let fixture: ComponentFixture<InputFileComponent>;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                    declarations: [
                        InputFileComponent
                    ],
                    imports: [
                        ReactiveFormsModule,
                        FormsModule,
                        // Material modules
                        MatFormFieldModule,
                        MatInputModule,
                        MatButtonModule,
                        MatIconModule,
                        MatChipsModule
                    ],
                    providers: [
                        { provide: NgControl, useValue: NG_VALUE_ACCESSOR }
                    ]
                })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(InputFileComponent);
            component = fixture.componentInstance;
            fixture.componentInstance.formCtrl = new FormControl("formCtrl");
            fixture.detectChanges();
        });

        it("should be created",
            () => {
                expect(component).toBeTruthy();
            });
        it("Should remove one file after remove is clicked",
            () => {
                let dummyFiles = new Array<File>();
                dummyFiles.push(new File(["blah"], "blah.txt"));
                dummyFiles.push(new File(["dummy"], "dummy.txt"));
                component.value = new FileInput(dummyFiles);
                component.fileRemove(0, new MouseEvent("click"));

                expect(component.files.length).toBe(1);
                expect(component.fileNames).toBe("dummy.txt");
            });

        it("Should be empty if last file is removed",
            () => {
                let dummyFiles = new Array<File>();
                dummyFiles.push(new File(["blah"], "blah.txt"));
                dummyFiles.push(new File(["dummy"], "dummy.txt"));

                component.value = new FileInput(dummyFiles);
                component.fileRemove(0, new MouseEvent("click"));
                component.fileRemove(0, new MouseEvent("click"));

                expect(component.files.length).toBe(0);
                expect(component.empty).toBe(true);
            });

        it("Should be empty if default files are all removed",
            () => {
                let dummyFiles = new Array<ServerSideFileData>();
                dummyFiles.push({fileName: "dummy file 1"} as ServerSideFileData);

                component.defaultAttachments = dummyFiles;
                component.removeDefault(0, new MouseEvent("click"));

                expect(component.defaultAttachments.length).toBe(0);
            });
    });

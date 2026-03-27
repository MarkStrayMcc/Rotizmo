import { FileInput } from './file-input.model';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { IMaxContentSize } from '../../interfaces/IMaxContentSize';

export class FileValidators {

    /**
     * Function to control total size of files
     *
     * @param control
     *
     * @returns
     */
    static maxContentSize(bytes: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const size = control && control.value ? (control.value as FileInput).
                files.map(f => f.size).reduce((acc, i) => acc + i, 0) : 0;
            const condition = bytes >= size;
            return condition ? null : {
                maxContentSize: {
                    actualSize: size,
                    maxSize: bytes
                }
            } as IMaxContentSize;
        }
    }

    /**
     * Limit size of individual files
     *
     * @param control
     *
     * @returns max content size with sizes in mb
     */
    static maxFileSize(bytes: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const filesTooLarge = control && control.value
                ? (control.value as FileInput).files.filter((f) => {
                    return f.size > bytes;
                }) : [];

            const condition = filesTooLarge.length <= 0;
            let result = filesTooLarge.map((f) => {
                return {
                    maxContentSize: {
                        name: f.name,
                        actualSize: ((f.size / 1024) / 1024),
                        maxSize: ((bytes / 1024) / 1024)
                    }
                } as IMaxContentSize;
            });

            return condition ? null : {
                fileErrors: result
            };
        }
    }

    /**
     * Limit size of individual files
     *
     * @param control
     *
     * @returns files with wrong file types
     */
    static validFileTypes(types: string[]): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const wrongFileTypes = control && control.value
                ? (control.value as FileInput).files.filter((f) => {
                    return types.find((t) => {
                        return f.name.endsWith(t.trim());
                    }) === undefined;
                }) : [];

            const condition = wrongFileTypes.length <= 0;
            const result = wrongFileTypes.map((f) => {
                return {
                    wrongFileType: {
                        name: f.name
                    }
                };
            });

            return condition ? null : {
                wrongFileTypes: result
            };
        }
    }

    /**
     * Prevent duplicate file names
     *
     * @param control
     *
     * @returns files that occur more than once
     */
    static duplicateFiles(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            let files = control && control.value
                ? (control.value as FileInput).files : [];
            let dupeFiles: File[] = [];

            files.forEach((f: File, index: number) => {
                files.forEach((compareFile, compareIndex: number) => {
                    if (f.name === compareFile.name && index !== compareIndex) {
                        // only add once for the two dupes
                        if (!dupeFiles.find((item) => {
                            return item.name === f.name;
                        })) {
                            dupeFiles.push(f);
                        }
                    }
                });
            });

            const condition = dupeFiles.length <= 0;
            const result = dupeFiles.map((f) => {
                return {
                    duplicateFile: {
                        name: f.name
                    }
                };
            });

            return condition ? null : {
                duplicateFiles: result
            };
        }
    }
    /**
     * Limit number of files
     *
     * @param control
     *
     * @returns
     */
    static maxFileCount(count: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const size = control && control.value ? (control.value as FileInput).files.length : 0;
            const condition = count >= size;
            return condition ? null : {
                maxFileCount: {
                    number: size,
                    max: count
                }
            };
        }
    }
}

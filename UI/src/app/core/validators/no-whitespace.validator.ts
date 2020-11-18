import { AbstractControl, ValidatorFn } from '@angular/forms';

export function NoWhitespaceValidator(): ValidatorFn {

    return (control: AbstractControl): { [key: string]: any } => {
        let isValid = true;
        if (control.value !== '' && control.value !== null && control.value !== undefined) {
            const controlValue = (control.value).toString();
            const isWhitespace = controlValue.trim().length === 0;
            isValid = !isWhitespace;
        }
        return isValid ? null : { 'whitespace': true };
    };
}

import { Directive, Input, OnInit, HostListener } from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[currencyFormat]',
})

export class CurrencyDirective implements OnInit {

    @Input() public currencyControl: FormControl;
    public initValueChanged = false;

    public ngOnInit() {
        this.currencyControl.valueChanges
            .subscribe((value) => this.onInputChange(value));

        if (this.currencyControl.value != null && this.currencyControl.value !== ''
        && !isNaN(this.currencyControl.value)) {
            const formatted = this.formatCurrency(this.currencyControl.value);
            setTimeout(() => this.currencyControl.setValue(formatted));
        }
    }

    @HostListener('blur')
    public onBlur() {
        const val = this.currencyControl.value;
        const withoutComma = this.getNumberWihoutComma(val);
        if (withoutComma != null && !isNaN(withoutComma)) {
            const formatted = this.formatCurrency(withoutComma);
            this.currencyControl.setValue(formatted);
        }
    }

    @HostListener('focus')
    public onFocus() {
        this.initValueChanged = true;
    }

    @HostListener('keyup', ['$event'])
    public onKeyUp(event: any) {
        let val = this.currencyControl.value;
        if (isNaN(val)) {
            val = val.replace(/[^0-9\.]/g, '');
            if (val.split('.').length > 2) {
                val = val.replace(/\.+$/, '');
            }
            this.currencyControl.setValue(val);
        }
    }

    public onInputChange(val: any) {
        if (this.currencyControl.errors != null) {
            return;
        }
        if (!this.isValueInRange(val)) {
            const error = { invalidCurrencyRange: true };
            this.currencyControl.setErrors(error);
        }

        if (!this.initValueChanged && this.currencyControl.pristine) {
            if (val != null && !isNaN(val)) {
                const formatted = this.formatCurrency(val);
                setTimeout(() => this.currencyControl.setValue(formatted));
                this.initValueChanged = true;
            }
        }
    }

    public isValueInRange(value: any): boolean {

        if (isNaN(parseFloat(value))) { return true; }

        const regex = new RegExp(',', 'g');
        const withoutComma = Number(value.toString().replace(regex, ''));

        if (withoutComma < 0) {
            return false;
        }
        if (withoutComma > 999999999.99) {
            return false;
        }

        return true;
    }

    public formatCurrency(value: any): string {

        if (value == null) { return ''; }

        if (isNaN(parseFloat(value))) { return ''; }

        const withoutComma = this.getNumberWihoutComma(value);
        const withTwoDecimalPlaces = parseFloat(withoutComma).toFixed(2);

        const parts = withTwoDecimalPlaces.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    public getNumberWihoutComma(value: any) {

        if (value == null) { return ''; }

        const regex = new RegExp(',', 'g');
        return value.toString().replace(regex, '');
    }
}

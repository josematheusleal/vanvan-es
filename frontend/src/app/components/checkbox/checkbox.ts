import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Checkbox),
      multi: true
    }
  ]
})
export class Checkbox implements ControlValueAccessor {
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(): void {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.onChange(this.checked);
      this.onTouched();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get containerClasses(): string {
    const base = 'w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer';
    
    if (this.disabled) {
      return `${base} opacity-50 cursor-not-allowed bg-accent`; // Assuming disabled is just faded
    }

    if (this.checked) {
      return `${base} bg-primary`;
    }

    // Default / Off state
    return `${base} bg-accent shadow-inner`;
  }
}

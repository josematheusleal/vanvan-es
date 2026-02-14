import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export type TextfieldState = 'default' | 'valid' | 'error';
export type TextfieldType = 'text' | 'password' | 'email' | 'textarea';

@Component({
  selector: 'app-textfield',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './textfield.html',
  styleUrl: './textfield.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Textfield),
      multi: true
    }
  ]
})
export class Textfield implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Textfield text';
  @Input() type: TextfieldType = 'text';
  @Input() state: TextfieldState = 'default';
  @Input() disabled: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';

  value: string = '';
  focused: boolean = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get containerClasses(): string {
    const base = 'w-[320px] bg-light rounded-lg px-4 py-3 flex relative gap-2 transition-all duration-200 overflow-hidden border box-border';
    const alignClass = this.type === 'textarea' ? 'items-start' : 'items-center';
    
    // States
    if (this.disabled) {
      return `w-[320px] bg-light rounded-lg min-h-[48px] px-4 py-3 flex ${alignClass} relative gap-2 opacity-100 cursor-not-allowed text-subtle-text overflow-hidden border-transparent`;
    }

    // Border logic
    let borderColor = 'border-transparent';
    
    if (this.state === 'error') borderColor = 'border-primary';
    else if (this.state === 'valid') borderColor = 'border-success';
    else if (this.focused) borderColor = 'border-secondary'; 
    
    return `${base} ${alignClass} ${borderColor}`;
  }

  get inputClasses(): string {
    // Shared classes for input and textarea
    const base = 'w-full bg-transparent border-primary outline-none font-medium text-base text-dark placeholder-subtle-text p-0 font-["Work_Sans"] leading-[1.4]';
    return base;
  }

  onFocus(): void {
    if (!this.disabled) {
      this.focused = true;
      this.onTouched();
    }
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  // ControlValueAccessor
  writeValue(value: string): void {
    this.value = value || '';
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

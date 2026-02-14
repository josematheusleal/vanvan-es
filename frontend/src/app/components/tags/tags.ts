import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TagVariant = 'success' | 'info' | 'error' | 'warning' | 'neutral';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tags.html',
})
export class Tag {
  @Input() label: string = '';
  @Input() variant: TagVariant = 'neutral';
  @Input() bgColor: string = '';
  @Input() textColor: string = '';
  
  get tagClasses(): string {
    const base = 'inline-flex items-center justify-center px-[10px] py-[2px] rounded-[18px] font-["Google_Sans_Flex"] text-[16px] leading-tight whitespace-nowrap';
    
    // Exact colors from design
    const variants: Record<TagVariant, string> = {
      success: 'bg-[#def8ee] text-[#4aa785]', // Ativo
      info: 'bg-[#e2f5ff] text-[#59a8d4]',    // Em análise
      error: 'bg-[#f8dede] text-[#d45959]',   // Recusado
      warning: 'bg-[#f8f4de] text-[#d4b759]', // Aguardando
      neutral: 'bg-light text-subtle-text'     // Fallback
    };
    
    // Use base class + variant unless custom colors are provided (which override variant partially via style binding)
    // Style binding in template handles custom colors, this handles base + variant defaults.
    return `${base} ${variants[this.variant]}`;
  }
}

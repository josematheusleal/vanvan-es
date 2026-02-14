import { Component } from '@angular/core';
import { Buttons } from '../../components/buttons/buttons';
import { Toggle } from '../../components/toggle/toggle';
import { Textfield } from '../../components/textfield/textfield';
import { Tag } from '../../components/tags/tags';
import { Checkbox } from '../../components/checkbox/checkbox';
import { Toast } from '../../components/toast/toast';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-button-showcase',
  standalone: true,
  imports: [Buttons, Toggle, Textfield, Tag, Checkbox, Toast],
  templateUrl: './button-showcase.html',
  styleUrl: './button-showcase.css'
})
export class ButtonShowcase {
  toggleState1 = false;
  toggleState2 = true;
  toggleState3 = false;

  constructor(private toastService: ToastService) {}

  showSuccessToast() {
    this.toastService.success('Ação concluída com sucesso');
  }

  showErrorToast() {
    this.toastService.error('Erro na ação');
  }
}
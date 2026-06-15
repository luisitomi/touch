import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EspacioService } from '../../core/services/espacio.service';

@Component({
  selector: 'app-crear-espacio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-espacio.component.html',
  styleUrl: './crear-espacio.component.scss'
})
export class CrearEspacioComponent implements OnInit {
  espacioForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private espacioService: EspacioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.espacioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      capacidad: [null, [Validators.required, Validators.min(1)]],
      tarifaBaseHora: [null, [Validators.required, Validators.min(0)]],
      horarioApertura: ['08:00:00', [Validators.required]],
      horarioCierre: ['22:00:00', [Validators.required]]
    }, { validators: this.validarHorarios });
  }

  validarHorarios(form: FormGroup) {
    const apertura = form.get('horarioApertura')?.value;
    const cierre = form.get('horarioCierre')?.value;
    return apertura && cierre && cierre > apertura ? null : { horarioInvalido: true };
  }

  onSubmit(): void {
    if (this.espacioForm.invalid) {
      this.espacioForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formulario = { ...this.espacioForm.value };

    if (formulario.horarioApertura?.length === 5) formulario.horarioApertura += ':00';
    if (formulario.horarioCierre?.length === 5) formulario.horarioCierre += ':00';

    this.espacioService.crearEspacio(formulario).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.loading = false;

        this.espacioForm.reset({
          horarioApertura: '08:00:00',
          horarioCierre: '22:00:00'
        });

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Sucedió un error al registrar el espacio.';
        this.loading = false;
      }
    });
  }
}

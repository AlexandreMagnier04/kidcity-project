import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { User } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  
  user: User | null = null;
  profileForm: FormGroup = this.formBuilder.group({});
  loading = false;
  updateSuccess = false;
  error = '';
  userCards: any[] = [];
  loadingCards = false;

  ngOnInit(): void {
    this.initForm();
    this.loadUserProfile();
    this.loadUserCards();
  }

  initForm() {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]]
    });
  }

  loadUserProfile() {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          surname: user.surname,
          email: user.email
        });
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement du profil';
        console.error('Erreur lors du chargement du profil', error);
      }
    });
  }

  loadUserCards() {
    this.loadingCards = true;
    this.http.get<any[]>(`${environment.apiUrl}/users/cards`).subscribe({
      next: (cards) => {
        this.userCards = cards;
        this.loadingCards = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cartes', error);
        this.loadingCards = false;
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.updateSuccess = false;
    this.error = '';

    const formData = {
      name: this.profileForm.value.name,
      surname: this.profileForm.value.surname
    };

    this.http.patch<User>(`${environment.apiUrl}/users/profile`, formData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.updateSuccess = true;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors de la mise à jour du profil';
        this.loading = false;
        console.error('Erreur lors de la mise à jour du profil', error);
      }
    });
  }
}
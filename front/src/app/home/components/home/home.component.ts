import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';


interface Card {
  id: number;
  name: string;
  imageUrl: string;
  attributes: any[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  
  cards: Card[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards() {
    this.http.get<Card[]>(`${environment.apiUrl}/cards`)
      .subscribe({
        next: (data) => {
          this.cards = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des cartes';
          this.loading = false;
          console.error('Erreur lors du chargement des cartes', err);
        }
      });
  }
}
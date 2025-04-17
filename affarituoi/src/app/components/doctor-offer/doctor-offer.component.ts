import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-doctor-offer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-offer.component.html',
  styleUrls: ['./doctor-offer.component.scss']
})
export class DoctorOfferComponent implements OnInit {
  offer$!: Observable<number>;
  offerVisible$!: Observable<boolean>;
  offerDigits: string[] = [];
  offerLength: number = 0;

  constructor(private gameService: GameService) {}

  offerMode$!: Observable<'money' | 'change' | 'choice'>;

  ngOnInit(): void {
    this.offer$ = this.gameService.getOffer();
    this.offerVisible$ = this.gameService.getOfferVisibility();
    this.offerMode$ = this.gameService.getOfferMode();

    this.offer$.subscribe(offer => {
      if (offer != null) {
        const formatted = offer.toLocaleString('it-IT');
        this.offerDigits = formatted.split('');
        this.offerLength = this.offerDigits.length;
      } else {
        this.offerDigits = [];
        this.offerLength = 0;
      }
    });
  }

  choiceMade = false;
  playerChoice: 'money' | 'change' | null = null;

  selectOffer(choice: 'money' | 'change') {
    this.choiceMade = true;
    this.playerChoice = choice;
  }

  acceptChange(): void {
    this.gameService.performBoxSwap(); 
    this.choiceMade = false;
  }

  acceptOffer(): void {
    this.gameService.acceptOffer();
    this.choiceMade = false;
  }

  rejectOffer(): void {
    this.gameService.rejectOffer();
    this.choiceMade = false;
  }
}

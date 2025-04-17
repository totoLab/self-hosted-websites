import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { Observable } from 'rxjs';
import { PrizeBoardComponent } from './components/prize-board/prize-board.component';
import { DoctorOfferComponent } from './components/doctor-offer/doctor-offer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PrizeBoardComponent, DoctorOfferComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Affari Tuoi';
  remainingTurns$: Observable<number>;
  
  constructor(private gameService: GameService) {
    this.remainingTurns$ = this.gameService.getRemainingTurns();
  }

  toggleFullscreen(): void {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  callDoctor(): void {
    this.gameService.doctorCall();
  }

  resetGame(): void {
    this.gameService.resetGame();
  }
}
import { Component, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { Observable, combineLatest, map  } from 'rxjs';
import { PrizeBoardComponent } from './components/prize-board/prize-board.component';
import { DoctorOfferComponent } from './components/doctor-offer/doctor-offer.component';
import { MusicDashBoard } from "./music-dashboard/music-dashboard.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PrizeBoardComponent, DoctorOfferComponent, MusicDashBoard],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Affari Tuoi';
  remainingTurns$: Observable<number>;
  isDoctorCallDisabled$: Observable<boolean>;

  constructor(private gameService: GameService) {
    this.remainingTurns$ = this.gameService.getRemainingTurns();
    this.isDoctorCallDisabled$ = combineLatest([
      this.gameService.getDoctorThinking(),
      this.gameService.getGameEndedStatus()
    ]).pipe(
      map(([thinking, ended]) => thinking || ended)
    );
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
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Prize } from '../models/prize.model';
import { AudioService } from './audio.service';

type OfferMode = 'money' | 'change' | 'choice';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly initialPrizes = [0, 1, 5, 10, 25, 50, 75, 100, 200, 500, 5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000, 200000, 300000];

  // Assuming you have BehaviorSubjects for both
  private smallPrizesSubject = new BehaviorSubject<Prize[]>([]);
  private bigPrizesSubject = new BehaviorSubject<Prize[]>([]);
  
  private remainingTurns = new BehaviorSubject<number>(19);
  private offerMode = new BehaviorSubject<OfferMode>('money');
  private offer = new BehaviorSubject<number>(0);
  private offerVisible = new BehaviorSubject<boolean>(false);

  private doctorCallInProgress = new BehaviorSubject<boolean>(false);

  private gameEnded = new BehaviorSubject<boolean>(false);
  private doctorCalls = 0;

  constructor(private audioService: AudioService) {
    this.resetGame();
  }

  resetGame(): void {
    const sortedPrizes = [...this.initialPrizes].sort((a, b) => a - b);
    this.smallPrizesSubject.next(
      sortedPrizes
        .filter(value => value < 5000)
        .map(value => ({ value, smallBig: false, eliminated: false }))
    );
    this.bigPrizesSubject.next(
      sortedPrizes
        .filter(value => value >= 5000)
        .map(value => ({ value, smallBig: true, eliminated: false }))
    );
    
    this.remainingTurns.next(19);
    this.offer.next(0);
    this.offerVisible.next(false);
    this.gameEnded.next(false);
  }

  getSmallPrizes(): Observable<Prize[]> {
    return this.smallPrizesSubject.asObservable();
  }

  getBigPrizes(): Observable<Prize[]> {
    return this.bigPrizesSubject.asObservable();
  }

  getRemainingTurns(): Observable<number> {
    return this.remainingTurns.asObservable();
  }

  getOffer(): Observable<number> {
    return this.offer.asObservable();
  }

  getOfferVisibility(): Observable<boolean> {
    return this.offerVisible.asObservable();
  }

  getDoctorThinking(): Observable<boolean> {
    return this.doctorCallInProgress.asObservable();
  }

  getGameEndedStatus(): Observable<boolean> {
    return this.gameEnded.asObservable();
  }

  eliminatePrize(index: number, smallBig: boolean): void {
    const prizeListSubject = smallBig ? this.bigPrizesSubject : this.smallPrizesSubject;
    const currentPrizes = prizeListSubject.getValue();
  
    if (currentPrizes[index].eliminated) {
      this.undoEliminatePrize(index, smallBig);
      return;
    }

    const newPrizes = [...currentPrizes];
    newPrizes[index] = { ...newPrizes[index], eliminated: true };
    prizeListSubject.next(newPrizes);
  
    // Play appropriate sound
    if (newPrizes[index].value >= 5000) {
      this.audioService.playRedSound();
    } else {
      this.audioService.playBlueSound();
    }
  
    // Decrease remaining turns
    const newRemainingTurns = this.remainingTurns.getValue() - 1;
    this.remainingTurns.next(newRemainingTurns);
  
    // Trigger doctor's call at specific turns
    if ([15, 11, 6, 2].slice(this.doctorCalls).includes(newRemainingTurns)) {
      setTimeout(() => this.doctorCall(), 1000);
    }
  
    // Check if game is over
    if (newRemainingTurns === 0) {
      this.gameEnded.next(true);
    }
  }

  undoEliminatePrize(index: number, smallBig: boolean): void {
    const prizeListSubject = smallBig ? this.bigPrizesSubject : this.smallPrizesSubject;
    const currentPrizes = prizeListSubject.getValue();
  
    if (!currentPrizes[index].eliminated) return;
  
    const newPrizes = [...currentPrizes];
    newPrizes[index] = { ...newPrizes[index], eliminated: false };
    prizeListSubject.next(newPrizes);
  
    const newRemainingTurns = this.remainingTurns.getValue() + 1;
    this.remainingTurns.next(newRemainingTurns);
  
    if (this.gameEnded.getValue() && newRemainingTurns > 0) {
      this.gameEnded.next(false);
    }
  }
  
  
  doctorCall(): Promise<void> {
    if (this.gameEnded.getValue()) return new Promise(() => {}); // no new offers

    this.doctorCalls += 1;
    this.doctorCallInProgress.next(true);
    this.audioService.playSuoneriaDottore();
  
    return new Promise((resolve) => {
      this.delay(10, () => {
        const allPrizes = [
          ...this.smallPrizesSubject.getValue(),
          ...this.bigPrizesSubject.getValue()
        ];
        const remainingPrizes = allPrizes.filter(prize => !prize.eliminated);
        if (remainingPrizes.length === 0) {
          resolve(); // Done
          return;
        }
  
        const rand = Math.random();
  
        if (rand < 0.3) {
          this.setMoneyOffer(remainingPrizes);
          this.offerMode.next('money');
        } else if (rand < 0.6) {
          this.offerMode.next('change');
        } else {
          this.setMoneyOffer(remainingPrizes);
          this.offerMode.next('choice');
        }
  
        this.doctorCallInProgress.next(false);
        this.offerVisible.next(true);
        resolve(); // Done
      });
    });
  }
  
  
  private setMoneyOffer(remainingPrizes: Prize[]): void {
    const avg = remainingPrizes.reduce((sum, prize) => sum + prize.value, 0) / remainingPrizes.length;
    const calculatedOffer = Math.ceil(avg * 0.8 / 1000) * 1000;
    this.offer.next(calculatedOffer);
  }
  
  
  getOfferMode(): Observable<OfferMode> {
    return this.offerMode.asObservable();
  }
  
  acceptOffer(): void {
    this.offerVisible.next(false);
    this.gameEnded.next(true);
  }

  rejectOffer(): void {
    this.offerVisible.next(false);
  }

  performBoxSwap(): void {
    this.rejectOffer();
  }

  delay(s: number, callback: () => void): void {
    setTimeout(callback, s * 1000);
  }
}
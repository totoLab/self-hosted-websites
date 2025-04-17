import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Prize } from '../../models/prize.model';
import { Observable } from 'rxjs';
import { PrizeItemComponent } from '../prize-item/prize-item.component';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-prize-board',
  standalone: true,
  imports: [CommonModule, PrizeItemComponent],
  templateUrl: './prize-board.component.html',
  styleUrls: ['./prize-board.component.scss']
})
export class PrizeBoardComponent implements OnInit {
  prizes$!: Observable<Prize[]>;
  bigPrizes$!: Observable<Prize[]>;
  smallPrizes$!: Observable<Prize[]>;
  
  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.bigPrizes$ = this.gameService.getBigPrizes();
    this.smallPrizes$ = this.gameService.getSmallPrizes();
  }

  eliminatePrize(index: number, smallBig: boolean): void {
    this.gameService.eliminatePrize(index, smallBig);
  }
}
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prize } from '../../models/prize.model';

@Component({
  selector: 'app-prize-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prize-item.component.html',
  styleUrls: ['./prize-item.component.scss']
})
export class PrizeItemComponent {
  @Input() prize!: Prize;
  @Input() index!: number;
  @Output() eliminate = new EventEmitter<number>();

  ngOnInit(): void {
    this.prize.smallBig = this.prize.value >= 5000;
  }

  onEliminate(): void {
    if (!this.prize.eliminated) {
      this.eliminate.emit(this.index);
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { AudioService } from '../services/audio.service';
import { CommonModule } from '@angular/common';

interface AudioAsset {
  filename: string;
  displayName: string;
}

@Component({
  selector: 'app-music-dashboard',
  templateUrl: './music-dashboard.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./music-dashboard.component.scss']
})
export class MusicDashBoard implements OnInit {
  audioAssets: AudioAsset[] = [];
  nowPlayingText: string = 'Click on a track to play';
  currentTrack: AudioAsset | null = null;
  constructor(private audioService: AudioService) { }
  
  ngOnInit(): void {
    this.loadAudioAssets();
  }
  
  loadAudioAssets(): void {
    this.audioAssets = [
      { filename: 'LaResaDeiConti.mp3', displayName: 'La Resa Dei Conti' },
      { filename: 'LoSqualo.mp3', displayName: 'Lo Squalo' },
      { filename: 'OnceUponATimeInTheWest.mp3', displayName: 'Once Upon A Time In The West' },
      { filename: 'battito.mp3', displayName: 'Battito' },
      { filename: 'apertura.opus', displayName: 'Apertura' },
      { filename: 'italia.opus', displayName: 'Italia' },
      { filename: 'drammatica.opus', displayName: 'Drammatica' },
      { filename: 'scifi.opus', displayName: 'Scifi' },
      { filename: 'RicercaPaccoBlu.opus', displayName: 'Ricerca Pacco Blu' },
      { filename: 'ticchettio.mp3', displayName: 'Ticchettio' },
      { filename: 'cuoricini.mp3', displayName: 'Cuoricini' },
      { filename: 'paura.mp3', displayName: 'Paura' }
    ];
  }
  
  playSound(audio: AudioAsset): void {
    this.audioService.playSound(`assets/${audio.filename}`);
    this.nowPlayingText = `Now playing: ${audio.displayName}`;
    this.currentTrack = audio;
  }

  pause(): void {
    this.audioService.fadeVolume();
  }
}
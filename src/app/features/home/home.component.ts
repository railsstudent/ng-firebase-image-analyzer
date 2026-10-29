import { ArrowForwardIconComponent } from '@/shared/ui/icons/arrow-forward-icon/arrow-forward-icon.component';
import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  host: {
    class: 'flex-1 flex flex-col',
  },
  imports: [RouterLink, ArrowForwardIconComponent, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export default class HomeComponent {}

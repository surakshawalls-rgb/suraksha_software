import { Component, input } from '@angular/core';
import {
  LucideMegaphone, LucideMessagesSquare, LucidePanelsTopLeft, LucideSearch,
  LucideServer, LucideShoppingBag, LucideSmartphone, LucideWorkflow
} from '@lucide/angular';

@Component({
  selector: 'app-service-icon',
  imports: [
    LucidePanelsTopLeft, LucideWorkflow, LucideSmartphone, LucideShoppingBag,
    LucideMegaphone, LucideSearch, LucideMessagesSquare, LucideServer
  ],
  template: `
    @switch (name()) {
      @case ('web') { <svg lucidePanelsTopLeft class="icon"></svg> }
      @case ('software') { <svg lucideWorkflow class="icon"></svg> }
      @case ('mobile') { <svg lucideSmartphone class="icon"></svg> }
      @case ('commerce') { <svg lucideShoppingBag class="icon"></svg> }
      @case ('brand') { <svg lucideMegaphone class="icon"></svg> }
      @case ('search') { <svg lucideSearch class="icon"></svg> }
      @case ('messaging') { <svg lucideMessagesSquare class="icon"></svg> }
      @case ('hosting') { <svg lucideServer class="icon"></svg> }
    }
  `
})
export class ServiceIconComponent {
  readonly name = input.required<string>();
}

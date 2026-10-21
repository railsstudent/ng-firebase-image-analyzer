import {
  type CulinaryDestination,
  type CulinaryFoodItem,
  type CulinaryLocation,
  type CulinaryRecipeTarget,
  normalizeKeys,
  type StreamingCulinaryDiscoveryWithMetadata,
} from '@/core/culinary-guide';
import destinations from '@/core/culinary-guide/destinations.json';
import { Component, computed, injectAsync, signal } from '@angular/core';
import { DEFAULT_DISCOVERY_DATA } from './constants/culinary-guide.const';
import { CulinaryDiscoveryPanelComponent } from './culinary-discovery-panel/culinary-discovery-panel.component';
import { CulinaryDishListComponent } from './culinary-dish-list/culinary-dish-list.component';
import { CulinarySearchBoxComponent } from './culinary-search-box/culinary-search-box.component';
import type { CulinaryRecipeDetail } from './interfaces/culinary-recipe-detail.interface';

@Component({
  selector: 'app-culinary-guide',
  imports: [CulinaryDiscoveryPanelComponent, CulinarySearchBoxComponent, CulinaryDishListComponent],
  styleUrl: './culinary-guide.component.css',
  templateUrl: './culinary-guide.component.html',
})
export default class CulinaryGuideComponent {
  #asyncCoordinatorService = injectAsync(() =>
    import('./services/culinary-guide-coordinator.service').then((m) => m.CulinaryGuideCoordinatorService),
  );

  discoveryData = signal<StreamingCulinaryDiscoveryWithMetadata | null>(null);
  expandedDishNames = signal<string[]>([]);
  recipes = signal<Record<string, CulinaryRecipeDetail>>({});
  dishes = computed(() => this.discoveryData()?.foods || []);
  currentLocation = signal<CulinaryLocation | undefined>(undefined);

  culinaryDestinations: CulinaryDestination[] = destinations.data;

  async search(location: CulinaryLocation): Promise<void> {
    try {
      this.currentLocation.set(location);
      const coordinatorService = await this.#asyncCoordinatorService();
      const generator = coordinatorService.search(location);

      for await (const chunk of generator) {
        this.discoveryData.set(chunk);
        if (this.expandedDishNames().length > 0) {
          this.expandedDishNames.set([]);
        }
        if (Object.keys(this.recipes()).length > 0) {
          this.recipes.set({});
        }
      }
    } catch {
      this.discoveryData.set(DEFAULT_DISCOVERY_DATA);
    }
  }

  async loadRecipe(foodItem: CulinaryFoodItem): Promise<void> {
    const dishName = normalizeKeys(foodItem.name);
    const recipeDetail: CulinaryRecipeDetail | undefined = this.recipes()[dishName];

    if (recipeDetail) {
      return;
    }

    const coordinatorService = await this.#asyncCoordinatorService();
    const location = this.currentLocation();
    if (!location) {
      return;
    }

    const recipeTarget: CulinaryRecipeTarget = { ...location, dishName: foodItem.name };
    const generator = coordinatorService.loadRecipe(recipeTarget);

    for await (const chunk of generator) {
      console.log('chunk', chunk);
      this.recipes.update((map) => ({
        ...map,
        [dishName]: chunk,
      }));
    }
  }
}

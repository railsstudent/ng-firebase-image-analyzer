import { normalizeKeys } from '@/core/culinary-guide';
import type { CulinaryFoodItem } from '@/core/culinary-guide/culinary-guide.interface';
import type { CulinaryRecipeDetail } from '@/features/culinary-guide/interfaces/culinary-recipe-detail.interface';
import { AccordionGroupComponent, AccordionItemComponent } from '@/shared/ui/components/accordion';
import { SkeletonComponent } from '@/shared/ui/components/skeleton';
import { TokenAnalyticsComponent } from '@/shared/ui/components/token-analytics/token-analytics.component';
import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-culinary-dish-list',
  imports: [AccordionGroupComponent, AccordionItemComponent, TokenAnalyticsComponent, SkeletonComponent],
  templateUrl: './culinary-dish-list.component.html',
  styleUrls: [
    '../../../shared/ui/styles/section-card.css',
    '../../../shared/ui/styles/empty-state.css',
    './culinary-dish-list.component.css',
  ],
})
export class CulinaryDishListComponent {
  dishes = input.required<CulinaryFoodItem[]>();
  expandedDishNames = model<string[]>([]);
  recipes = input<Record<string, CulinaryRecipeDetail>>({});
  isMulti = input(true);

  dishSelected = output<CulinaryFoodItem>();

  getRecipeDetail(dish: CulinaryFoodItem): CulinaryRecipeDetail | undefined {
    const dishName = normalizeKeys(dish.name);
    return this.recipes()[dishName];
  }

  onDishToggle(dish: CulinaryFoodItem, isExpanded: boolean): void {
    if (isExpanded) {
      this.dishSelected.emit(dish);
    }
  }
}

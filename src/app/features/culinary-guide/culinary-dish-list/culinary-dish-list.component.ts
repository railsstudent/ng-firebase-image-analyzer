import type { CulinaryFoodItem } from '@/core/culinary-guide/culinary-guide.interface';
import type { CulinaryRecipeDetail } from '@/features/culinary-guide/interfaces/culinary-recipe-detail.interface';
import { AccordionGroupComponent, AccordionItemComponent } from '@/shared/ui/components/accordion';
import { SkeletonComponent } from '@/shared/ui/components/skeleton';
import { TokenAnalyticsComponent } from '@/shared/ui/components/token-analytics/token-analytics.component';
import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-culinary-dish-list',
  imports: [AccordionGroupComponent, AccordionItemComponent, TokenAnalyticsComponent, SkeletonComponent],
  styleUrl: './culinary-dish-list.component.css',
  templateUrl: './culinary-dish-list.component.html',
})
export class CulinaryDishListComponent {
  dishes = input.required<CulinaryFoodItem[]>();
  expandedDishNames = model<string[]>([]);
  recipes = input<Record<string, CulinaryRecipeDetail>>({});
  isMulti = input(true);

  dishSelected = output<CulinaryFoodItem>();

  private isDishExpanded(dishName: string): boolean {
    return this.expandedDishNames().includes(dishName);
  }

  onDishToggle(dish: CulinaryFoodItem, event?: Event): void {
    if (event?.target instanceof HTMLElement && event.target.closest('.dish-body')) {
      return;
    }

    if (this.isDishExpanded(dish.name)) {
      this.dishSelected.emit(dish);
    }
  }
}

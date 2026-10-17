export interface AccordionGroupContext {
  isItemExpanded(id: string): boolean;
  toggleItem(id: string): void;
}

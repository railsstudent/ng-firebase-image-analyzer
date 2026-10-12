import { TAB_GROUP_CONTEXT } from '@/shared/ui/components/tab-group/tab-group-context.const';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabComponent } from './tab.component';

describe('TabComponent', () => {
  let activeTabIdSignal: ReturnType<typeof signal<string | null>>;

  beforeEach(() => {
    activeTabIdSignal = signal<string | null>('tab-1');
  });

  describe('Isolated TabComponent', () => {
    let component: TabComponent;
    let fixture: ComponentFixture<TabComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TabComponent],
        providers: [
          provideZonelessChangeDetection(),
          {
            provide: TAB_GROUP_CONTEXT,
            useValue: { activeTabId: activeTabIdSignal },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TabComponent);
      component = fixture.componentInstance;
    });

    it('computes isActive as true when activeTabId matches id', async () => {
      fixture.componentRef.setInput('id', 'tab-1');
      fixture.componentRef.setInput('label', 'Tab 1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isActive()).toBe(true);

      const wrapper = (fixture.nativeElement as HTMLElement).querySelector('div');
      expect(wrapper?.classList.contains('hidden')).toBe(false);
    });

    it('computes isActive as false and applies hidden class when activeTabId does not match id', async () => {
      fixture.componentRef.setInput('id', 'tab-2');
      fixture.componentRef.setInput('label', 'Tab 2');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isActive()).toBe(false);

      const wrapper = (fixture.nativeElement as HTMLElement).querySelector('div');
      expect(wrapper?.classList.contains('hidden')).toBe(true);
    });

    it('updates isActive reactively when activeTabId changes', async () => {
      fixture.componentRef.setInput('id', 'tab-1');
      fixture.componentRef.setInput('label', 'Tab 1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isActive()).toBe(true);

      activeTabIdSignal.set('tab-2');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isActive()).toBe(false);
      const wrapper = (fixture.nativeElement as HTMLElement).querySelector('div');
      expect(wrapper?.classList.contains('hidden')).toBe(true);
    });

    it('renders fallback content when no content is projected', async () => {
      fixture.componentRef.setInput('id', 'tab-1');
      fixture.componentRef.setInput('label', 'Tab 1');
      fixture.detectChanges();
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      expect(element.textContent).toContain('No content at the moment');
    });
  });

  describe('TabComponent with projected content', () => {
    @Component({
      imports: [TabComponent],
      template: `
        <app-tab id="custom-tab" label="Custom">
          <p class="custom-content">Projected Tab Content</p>
        </app-tab>
      `,
    })
    class TestHostComponent {}

    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [
          provideZonelessChangeDetection(),
          {
            provide: TAB_GROUP_CONTEXT,
            useValue: { activeTabId: activeTabIdSignal },
          },
        ],
      }).compileComponents();

      hostFixture = TestBed.createComponent(TestHostComponent);
    });

    it('projects custom content inside the tab container', async () => {
      activeTabIdSignal.set('custom-tab');
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      const compiled = hostFixture.nativeElement as HTMLElement;
      const customEl = compiled.querySelector('.custom-content');
      expect(customEl?.textContent).toBe('Projected Tab Content');

      const wrapper = compiled.querySelector('app-tab div');
      expect(wrapper?.classList.contains('hidden')).toBe(false);
    });
  });
});

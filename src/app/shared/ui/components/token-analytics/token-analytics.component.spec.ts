import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenAnalyticsComponent } from './token-analytics.component';

describe('TokenAnalyticsComponent', () => {
  let component: TokenAnalyticsComponent;
  let fixture: ComponentFixture<TokenAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenAnalyticsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenAnalyticsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

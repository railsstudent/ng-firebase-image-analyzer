import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenAnalytics } from './token-analytics';

describe('TokenAnalytics', () => {
  let component: TokenAnalytics;
  let fixture: ComponentFixture<TokenAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenAnalytics],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenAnalytics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

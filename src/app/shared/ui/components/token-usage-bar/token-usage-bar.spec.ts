import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenUsageBar } from './token-usage-bar';

describe('TokenUsageBar', () => {
  let component: TokenUsageBar;
  let fixture: ComponentFixture<TokenUsageBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenUsageBar],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenUsageBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

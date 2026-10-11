import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenUsageBarComponent } from './token-usage-bar.component';

describe('TokenUsageBarComponent', () => {
  let component: TokenUsageBarComponent;
  let fixture: ComponentFixture<TokenUsageBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenUsageBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenUsageBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

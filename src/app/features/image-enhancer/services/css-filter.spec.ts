import { TestBed } from '@angular/core/testing';

import { CssFilter } from './css-styling';

describe('CssStyling', () => {
  let service: CssFilter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CssFilter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

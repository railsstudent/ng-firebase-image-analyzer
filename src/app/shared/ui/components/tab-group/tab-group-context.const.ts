import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';

export const TAB_GROUP_CONTEXT = new InjectionToken<{ activeTabId: Signal<string | null> }>('TAB_GROUP_CONTEXT');

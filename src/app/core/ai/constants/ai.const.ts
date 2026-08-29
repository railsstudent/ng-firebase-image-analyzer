import { InjectionToken } from '@angular/core';
import { AI } from 'firebase/ai';

export const FIREBASE_AI = new InjectionToken<AI>('FirebaseAI');

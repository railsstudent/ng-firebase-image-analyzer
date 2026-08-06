import { FIREBASE_AI } from '@/features/ai/constants/ai.const';
import { ConfigService } from '@/features/ai/services/config.service';
import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { getAI, VertexAIBackend } from 'firebase/ai';
import { getValue } from 'firebase/remote-config';

export function provideFirebaseAI(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FIREBASE_AI,
      useFactory: () => {
        const configService = inject(ConfigService);
        const location = getValue(configService.RemoteConfig, 'vertexAILocation').asString() || 'global';
        return getAI(configService.firebaseApp, {
          backend: new VertexAIBackend(location),
        });
      },
    },
  ]);
}

import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { getAI, VertexAIBackend } from 'firebase/ai';
import { getValue } from 'firebase/remote-config';
import { FIREBASE_AI } from '../constants/ai.constants';
import { ConfigService } from '../services/config.service';

export function provideFirebaseAI(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FIREBASE_AI,
      useFactory: () => {
        const configService = inject(ConfigService);
        const app = configService.firebaseApp;
        const remoteConfig = configService.RemoteConfig;
        const location = getValue(remoteConfig, 'vertexAILocation').asString() || 'global';
        return getAI(app, {
          backend: new VertexAIBackend(location),
        });
      },
    },
  ]);
}

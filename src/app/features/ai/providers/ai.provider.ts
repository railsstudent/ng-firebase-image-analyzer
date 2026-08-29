import { FIREBASE_AI } from '@/features/ai/constants/ai.const';
import { ConfigService } from '@/features/ai/services/config.service';
import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { AgentPlatformBackend, getAI } from 'firebase/ai';
import { getValue } from 'firebase/remote-config';

export function provideFirebaseAI(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FIREBASE_AI,
      useFactory: () => {
        const configService = inject(ConfigService);
        const remoteConfig = configService.RemoteConfig;

        const location = getValue(remoteConfig, 'vertexAILocation').asString() || 'global';
        const useLimitedUseAppCheckTokens = getValue(remoteConfig, 'useLimitedUseAppCheckTokens').asBoolean();

        return getAI(configService.firebaseApp, {
          backend: new AgentPlatformBackend(location),
          useLimitedUseAppCheckTokens,
        });
      },
    },
  ]);
}

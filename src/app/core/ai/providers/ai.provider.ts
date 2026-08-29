import { FIREBASE_AI } from '@/core/ai/constants/ai.const';
import { ConfigService } from '@/core/ai/services/config.service';
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

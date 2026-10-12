import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { AgentPlatformBackend, getAI } from 'firebase/ai';
import { FIREBASE_AI } from './ai.const';
import { ConfigService } from './config.service';

export function provideFirebaseAI(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FIREBASE_AI,
      useFactory: async () => {
        const configService = inject(ConfigService);
        const remoteAppConfig = configService.appConfig;

        return getAI(await configService.getApp(), {
          backend: new AgentPlatformBackend(remoteAppConfig.vertexAILocation),
          useLimitedUseAppCheckTokens: remoteAppConfig.useLimitedUseAppCheckTokens,
        });
      },
    },
  ]);
}

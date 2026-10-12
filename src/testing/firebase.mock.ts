import { vi } from 'vitest';

export function resolveRemoteConfigString(key: string): string {
  switch (key) {
    case 'vertexAILocation':
      return 'us-central1';
    case 'geminiModelName':
      return 'gemini-1.5-flash';
    case 'geminiTTSModelName':
      return 'gemini-1.5-flash-tts';
    case 'thinkingLevel':
      return 'LOW';
    default:
      return '';
  }
}

export const mockGetGenerativeModel = vi.fn((_ai: unknown, params: unknown) => ({
  params,
  initializeDeviceModel: vi.fn().mockResolvedValue(undefined),
  generateContent: vi.fn().mockResolvedValue({}),
}));

export const mockGetAI = vi.fn().mockImplementation((app: unknown, options?: { backend?: unknown }) => ({
  backend: options?.backend ?? {
    backendType: 'VERTEX',
    _getModelPath: vi.fn().mockReturnValue('projects/demo/models/mock'),
  },
  backendType: 'VERTEX',
  app: app ?? {
    options: { projectId: 'demo-test-project' },
  },
}));

export const mockAgentPlatformBackend = vi.fn().mockImplementation(function (location?: unknown) {
  return {
    backendType: 'VERTEX',
    location,
    _getModelPath: vi.fn().mockReturnValue('projects/demo/models/mock'),
  };
});

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn().mockReturnValue({
    name: '[DEFAULT]',
    options: {
      projectId: 'demo-test-project',
      apiKey: 'test-api-key',
      appId: 'test-app-id',
    },
  }),
}));

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(),
  ReCaptchaEnterpriseProvider: vi.fn(),
}));

vi.mock('firebase/remote-config', () => ({
  getRemoteConfig: vi.fn().mockReturnValue({
    defaultConfig: {},
    settings: {},
  }),
  fetchAndActivate: vi.fn().mockResolvedValue(true),
  getValue: vi.fn((_rc: unknown, key: string) => ({
    asString: () => resolveRemoteConfigString(key),
    asBoolean: () => key === 'useLimitedUseAppCheckTokens',
    asNumber: () => 0,
  })),
}));

vi.mock('@firebase/ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@firebase/ai')>();
  return {
    ...actual,
    getGenerativeModel: mockGetGenerativeModel,
    getAI: mockGetAI,
    AgentPlatformBackend: mockAgentPlatformBackend,
  };
});

vi.mock('firebase/ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/ai')>();
  return {
    ...actual,
    getGenerativeModel: mockGetGenerativeModel,
    getAI: mockGetAI,
    AgentPlatformBackend: mockAgentPlatformBackend,
  };
});

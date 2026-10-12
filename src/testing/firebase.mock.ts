const mockGetGenerativeModel = vi.fn((_ai: unknown, params: unknown) => ({
  params,
  initializeDeviceModel: vi.fn().mockResolvedValue(undefined),
  generateContent: vi.fn().mockResolvedValue({}),
}));

vi.mock('@firebase/ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@firebase/ai')>();
  return {
    ...actual,
    getGenerativeModel: mockGetGenerativeModel,
  };
});

vi.mock('firebase/ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/ai')>();
  return {
    ...actual,
    getGenerativeModel: mockGetGenerativeModel,
  };
});

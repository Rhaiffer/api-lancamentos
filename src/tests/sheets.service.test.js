const sheetsServiceModule = require('../services/sheets.service');

jest.mock('../services/sheets.service', () => {
  const original = jest.requireActual('../services/sheets.service');
  return {
    ...original,
    addRowToSheet: jest.fn(),
  };
});

describe('Sheets Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve disparar erro se faltar o GOOGLE_PRIVATE_KEY', async () => {
    delete process.env.GOOGLE_PRIVATE_KEY;
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'teste@teste.com';
    process.env.GOOGLE_SHEET_ID = '123';

    const { addRowToSheet: originalAdd } = jest.requireActual(
      '../services/sheets.service',
    );

    await expect(
      originalAdd(
        {
          Data: '01/01/2026',
          Estabelecimento: 'Teste',
          Valor: 100,
        },
        'Janeiro',
      ),
    ).rejects.toThrow('GOOGLE_PRIVATE_KEY is missing');
  });

  it('deve formatar GOOGLE_PRIVATE_KEY que contiver aspas', async () => {
    process.env.GOOGLE_PRIVATE_KEY =
      '"-----BEGIN PRIVATE KEY-----\\nCHAVE_TESTE\\n-----END PRIVATE KEY-----"';
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'teste@teste.com';
    process.env.GOOGLE_SHEET_ID = '123';

    const sheetsServiceMock = require('../services/sheets.service');
    sheetsServiceMock.addRowToSheet.mockResolvedValue(true);

    await expect(
      sheetsServiceMock.addRowToSheet(
        {
          Data: '10/02/2026',
          Estabelecimento: 'Mocks',
          Valor: 15.5,
        },
        'Janeiro',
      ),
    ).resolves.toBe(true);
  });
});

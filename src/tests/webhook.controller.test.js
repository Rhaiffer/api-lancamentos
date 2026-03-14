const { handleWebhook } = require('../controllers/webhook.controller');
const sheetsService = require('../services/sheets.service');
const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

// Mock do sheetsService
jest.mock('../services/sheets.service', () => ({
  addRowToSheet: jest.fn(),
}));

describe('Webhook Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('deve retornar erro 400 se Estabelecimento ou Valor não forem enviados', async () => {
    mockReq.body = { Data: '10/10/2023' };

    await handleWebhook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Establishment and amount are required',
    });
  });

  it('deve formatar valor em texto para float, adicionar linha na planilha e retornar 200', async () => {
    mockReq.body = {
      Estabelecimento: 'Mercado Teste',
      Valor: 'R$ 1.500,50',
      Data: '15/03/2026',
    };

    sheetsService.addRowToSheet.mockResolvedValue(true);

    await handleWebhook(mockReq, mockRes);

    // Mês de março (03) -> Março
    expect(sheetsService.addRowToSheet).toHaveBeenCalledWith(
      {
        Estabelecimento: 'Mercado Teste',
        Valor: 1500.5,
        Data: '15/03/2026', // Pode depender da timezone que o teste rodar, mas toLocaleDateString é esperado
      },
      'Março',
    );

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Data added to spreadsheet successfully in sheet "Março"',
    });
  });

  it('deve lidar com números numéricos enviados na requisição', async () => {
    mockReq.body = {
      Estabelecimento: 'Loja',
      Valor: 250.75, // Valor numérico diretamente
    };

    sheetsService.addRowToSheet.mockResolvedValue(true);

    await handleWebhook(mockReq, mockRes);

    // O mês dependerá da data atual já que não passamos Data no body, mas podemos testar o formato do valor
    const callArgs = sheetsService.addRowToSheet.mock.calls[0][0];
    expect(callArgs.Valor).toBe(250.75);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar erro 500 se o sheetsService falhar', async () => {
    mockReq.body = {
      Estabelecimento: 'Padaria',
      Valor: 10,
    };

    sheetsService.addRowToSheet.mockRejectedValue(
      new Error('Google Sheets API Error'),
    );

    await handleWebhook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });
});

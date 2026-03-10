const sheetsService = require('../services/sheets.service');
const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

const handleWebhook = async (req, res) => {
  try {
    const {
      Estabelecimento: establishment,
      Valor: amount,
      Data: date,
    } = req.body;

    if (!establishment || !amount) {
      return res
        .status(400)
        .json({ error: 'Establishment and amount are required' });
    }

    let cleanAmount = amount;
    if (typeof amount === 'string') {
      cleanAmount = parseFloat(
        amount.replace('R$', '').replace(/\./g, '').replace(',', '.').trim(),
      );
    }

    let transactionDate = new Date();
    if (date) {
      const [day, month, year] = date.split('/');
      if (day && month && year) {
        transactionDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );
      } else {
        transactionDate = new Date(date);
      }
    }
    const formattedDate = transactionDate.toLocaleDateString('pt-BR');

    const monthName = format(transactionDate, 'MMMM', { locale: ptBR });
    const sheetTitle = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const rowCheck = {
      Estabelecimento: establishment,
      Valor: cleanAmount,
      Data: formattedDate,
    };

    await sheetsService.addRowToSheet(rowCheck, sheetTitle);

    return res.status(200).json({
      message: `Data added to spreadsheet successfully in sheet "${sheetTitle}"`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleWebhook,
};

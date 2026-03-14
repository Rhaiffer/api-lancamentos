const path = require('path');
const fs = require('fs');

require('dotenv').config();

class SheetsService {
  async addRowToSheet(data, sheetTitle) {
    try {
      const { GoogleSpreadsheet } = await import('google-spreadsheet');
      const { JWT } = await import('google-auth-library');

      let privateKey = process.env.GOOGLE_PRIVATE_KEY;
      if (!privateKey) throw new Error('GOOGLE_PRIVATE_KEY is missing');

      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');

      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(
        process.env.GOOGLE_SHEET_ID,
        serviceAccountAuth,
      );

      await doc.loadInfo();
      let sheet = doc.sheetsByTitle[sheetTitle];

      if (!sheet) {
        sheet = await doc.addSheet({
          title: sheetTitle,
          headerValues: ['Categoria', 'Descrição', 'Valor (R$)'],
        });
      } else {
        try {
          await sheet.loadHeaderRow(2);
        } catch (err) {}
      }

      const rows = await sheet.getRows();
      let insertIndex = -1;
      let outrasDespesasFound = false;

      for (const row of rows) {
        const categoria = (row.get('Categoria') || '').trim();
        const descricao = (row.get('Descrição') || '').trim();

        if (descricao === 'Outras Despesas') {
          outrasDespesasFound = true;
        }

        if (categoria === 'Total Despesas') {
          insertIndex = row.rowNumber - 1;
          break;
        }
      }

      if (insertIndex === -1) {
        await sheet.addRow({
          Categoria: data.Data,
          Descrição: data.Estabelecimento,
          'Valor (R$)': data.Valor,
        });
      } else {
        const numRowsToInsert = outrasDespesasFound ? 1 : 3;

        const request = {
          insertDimension: {
            range: {
              sheetId: sheet.sheetId,
              dimension: 'ROWS',
              startIndex: insertIndex,
              endIndex: insertIndex + numRowsToInsert,
            },
            inheritFromBefore: true,
          },
        };

        await serviceAccountAuth.request({
          method: 'POST',
          url: `https://sheets.googleapis.com/v4/spreadsheets/${doc.spreadsheetId}:batchUpdate`,
          data: { requests: [request] },
        });

        await sheet.loadCells({
          startRowIndex: insertIndex,
          endRowIndex: insertIndex + numRowsToInsert + 2,
          startColumnIndex: 0,
          endColumnIndex: 3,
        });

        const borderStyle = { style: 'SOLID' };
        const commonBorders = {
          top: borderStyle,
          bottom: borderStyle,
          left: borderStyle,
          right: borderStyle,
        };

        if (!outrasDespesasFound) {
          const headerDescCell = sheet.getCell(insertIndex, 1);
          headerDescCell.value = 'Outras Despesas';
          headerDescCell.textFormat = { bold: true };

          sheet.getCell(insertIndex, 0).borders = commonBorders;
          sheet.getCell(insertIndex, 1).borders = commonBorders;
          sheet.getCell(insertIndex, 2).borders = commonBorders;

          const subHeadData = sheet.getCell(insertIndex + 1, 0);
          const subHeadEst = sheet.getCell(insertIndex + 1, 1);
          const subHeadVal = sheet.getCell(insertIndex + 1, 2);

          subHeadData.value = 'Data';
          subHeadEst.value = 'Estabelecimento';
          subHeadVal.value = 'Valor';

          const boldFormat = { bold: true };
          subHeadData.textFormat = boldFormat;
          subHeadEst.textFormat = boldFormat;
          subHeadVal.textFormat = boldFormat;

          subHeadData.borders = commonBorders;
          subHeadEst.borders = commonBorders;
          subHeadVal.borders = commonBorders;

          const dataValA = sheet.getCell(insertIndex + 2, 0);
          const dataValB = sheet.getCell(insertIndex + 2, 1);
          const dataValC = sheet.getCell(insertIndex + 2, 2);

          dataValA.value = data.Data;
          dataValB.value = data.Estabelecimento;
          dataValC.value = data.Valor;
          dataValC.numberFormat = { type: 'NUMBER', pattern: '#,##0.00' };

          dataValA.borders = commonBorders;
          dataValB.borders = commonBorders;
          dataValC.borders = commonBorders;
        } else {
          const cellA = sheet.getCell(insertIndex, 0);
          const cellB = sheet.getCell(insertIndex, 1);
          const cellC = sheet.getCell(insertIndex, 2);

          cellA.value = data.Data;
          cellB.value = data.Estabelecimento;
          cellC.value = data.Valor;
          cellC.numberFormat = { type: 'NUMBER', pattern: '#,##0.00' };

          cellA.borders = commonBorders;
          cellB.borders = commonBorders;
          cellC.borders = commonBorders;
        }

        const totalRowIndex = insertIndex + numRowsToInsert;
        try {
          const totalValCell = sheet.getCell(totalRowIndex, 2);

          if (totalValCell.formula && totalValCell.formula.includes('SUM')) {
            const newEndRow = totalRowIndex;
            const newFormula = totalValCell.formula.replace(
              /:([A-Z]+)(\d+)\)/,
              `:$1${newEndRow})`,
            );
            if (newFormula !== totalValCell.formula) {
              totalValCell.formula = newFormula;
            }
          }
        } catch (err) {}

        await sheet.saveUpdatedCells();
      }
      return true;
    } catch (error) {
      throw error;
    }
  } // Fim de addRowToSheet
} // Fim de class SheetsService

module.exports = new SheetsService();

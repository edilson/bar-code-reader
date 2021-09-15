import { Request, Response } from 'express';
import { addDays } from 'date-fns';

import { transformDigitableLineInCodeBar } from '../utils';

export default class BarCodeController {
  public async reader(request: Request, response: Response): Promise<Response> {
    const { digitableLine } = request.params;

    if (digitableLine.length < 44 || digitableLine.length > 48) {
      return response.status(400).json({
        message: 'A linha digitável precisa ter entre 44 e 48 números.',
      });
    }

    if (digitableLine.match(/^[0-9]+$/) == null) {
      return response.status(400).json({
        message: 'A linha digitável deve conter somente números',
      });
    }

    const barCode = transformDigitableLineInCodeBar(digitableLine);

    let barCodeAmount = 0;

    let expirationDate;

    if (barCode[0] !== '8') {
      barCodeAmount = parseFloat(barCode.slice(9, 19)) / 100;

      const expirationFactor = parseInt(barCode.slice(5, 9));

      const baseDateToCalculateExpirationFactor = new Date(1997, 9, 7);

      expirationDate = addDays(
        baseDateToCalculateExpirationFactor,
        expirationFactor
      );
    } else {
      barCodeAmount = parseFloat(barCode.slice(4, 15)) / 100;
    }

    return response
      .status(200)
      .json({ barCode, amount: barCodeAmount, expirationDate });
  }
}

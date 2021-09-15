import { Router } from 'express';

import BarCodeController from '../controllers/BarCodeController';

const router = Router();

const barCodeController = new BarCodeController();

router.get('/boleto/:digitableLine', barCodeController.reader);

export default router;

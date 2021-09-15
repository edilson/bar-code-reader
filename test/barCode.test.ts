import request from 'supertest';

import server from '../src/server';

describe('GET /boleto/:digitableLine', () => {
  it('should return 200 with the amount', () => {
    return request(server)
      .get('/boleto/846400000002425700820896992998117616338191653991')
      .expect(200)
      .then(response => {
        expect(response.body.barCode).toEqual(
          '8468000000042570082208969929981176133819165399'
        );

        expect(response.body.amount).toEqual(42.57);

        expect(response.body.expirationDate).toBeUndefined();
      });
  });

  it('should return 200 with the amount and expiration date', () => {
    return request(server)
      .get('/boleto/03399114063370000045995166201012687390000017274')
      .expect(200)
      .then(response => {
        expect(response.body.barCode).toEqual(
          '03396873900000172749114033700000459516620101'
        );

        expect(response.body.amount).toEqual(172.74);

        expect(response.body.expirationDate).toEqual(
          '2021-09-10T03:00:00.000Z'
        );
      });
  });

  it('should return 400 when the digitable line does not have only numbers', () => {
    return request(server)
      .get('/boleto/033991140633700000459951662010126873900000172su')
      .expect(400)
      .then(response => {
        expect(response.body.message).toEqual(
          'A linha digitável deve conter somente números'
        );
      });
  });

  it('should return 400 when the digitable line has more than 48 digits', () => {
    return request(server)
      .get(
        '/boleto/03399114063370000045995166201012687390000017274984763527283'
      )
      .expect(400)
      .then(response => {
        expect(response.body.message).toEqual(
          'A linha digitável precisa ter entre 44 e 48 números.'
        );
      });
  });
});

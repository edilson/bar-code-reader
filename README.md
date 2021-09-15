# Leitor de linha digitável

Esse programa foi criado com o intuito de ler informações de linhas digitáveis.

### Tecnologias Usadas

- NodeJS
- Express
- Supertest e Jest

### Passos para rodar o projeto

1 - Instalar as dependências: `yarn`  
2 - Rodar o servidor: `yarn dev`

### Para rodar os testes

`yarn test`

### Endpoints

```
GET /boleto/:digitableLine
```

O retorno esperado é:

```
200

{
  "barCode":"03396873900000172749114033700000459516620101",
  "amount":172.74,
  "expirationDate":"2021-09-10T03:00:00.000Z"
}
```

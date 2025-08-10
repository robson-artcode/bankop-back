# 🏦 BankOp Backend

API REST para gerenciamento de autenticação, carteiras, conversão e transferência de criptomoedas.

---

## 🚀 Funcionalidades

- Cadastro e login de usuários com JWT
- Gerenciamento de carteiras (salvos no banco)
- Conversão de moedas
- Transferências entre usuários
- Histórico de transações

---

## 🧰 Tecnologias Utilizadas

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/)
- [Class-validator](https://github.com/typestack/class-validator)

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos

- Node.js (>=16)
- PostgreSQL

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/bankop-backend.git
cd bankop-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure variáveis de ambiente
Crie um arquivo .env na raiz com as seguintes variáveis (exemplo):
```bash
PORT=3333
JWT_SECRET=we-believe-in-points
DATABASE_URL=postgresql://<seu_user>:<seu_password>@localhost:5432/bankop
```

4. Rode a aplicação em modo desenvolvimento:
```bash
npm run start:dev
```
---

## 📄 Endpoints Principais

### Autenticação

POST /auth/register - Cadastro de usuário

**Body:**
```bash
{
  "name": "João",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta:**
```bash
{
  "id": "uuid",
  "name": "João",
  "email": "joao@email.com"
}
```
POST /auth/login - Login e obtenção do token JWT

**Body:**
```bash
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta:**
```bash
{
  "access_token": "token_jwt"
}
```

### Carteiras

GET /wallets - Retorna as carteiras do usuário autenticado

**Headers:**
```bash
Authorization: Bearer <token_jwt>
```

PATCH /wallets/convert - Converte moedas

**Body:**
```bash
{
  "fromCoin": "OPCOIN",
  "toCoin": "BRL",
  "amount": 100
}
```
POST /wallets/transfer - Transferência entre usuários

**Body:**
```bash
{
  "toUserEmail": "maria@email.com",
  "coin": "OPCOIN",
  "amount": 50
}
```

### Transações
GET /transactions - Retorna histórico de transações do usuário autenticado

**Headers:**
```bash
Authorization: Bearer <token_jwt>
```


## 💡 Decisões Técnicas

- NestJS Framework: Escolhido por sua arquitetura modular e suporte nativo a TypeScript
- PostgreSQL: Banco relacional para garantia de ACID nas transações financeiras
- JWT Stateless: Autenticação sem sessão para escalabilidade

---

## License

[MIT](https://choosealicense.com/licenses/mit/)
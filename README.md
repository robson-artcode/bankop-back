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
- [Prisma](https://prisma.io/)
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
git clone https://github.com/robson-artcode/bankop-back.git
cd bankop-back
```

2. Configure variáveis de ambiente
Crie um arquivo .env na raiz com as seguintes variáveis (exemplo):
```bash
PORT=3333
APP_URL=http://localhost:3000
JWT_SECRET=we-believe-in-points
DATABASE_URL=postgresql://<seu_user>:<seu_password>@<seu_host>:5432/<seu_banco>
```

3. Instale as dependências e configurações:
```bash
npm run setup
```

Dica: Pode dar o nome do banco que será criado de *'bankop'*

4. Rode a aplicação em modo desenvolvimento:
```bash
npm run start:dev
```

---
## 📖 Guia Rápido

### Início 


### 1️⃣ Cadastro
Ao se registrar, você recebe 5.000 OpCoins (promoção).

Conversão: 5 OpCoins = 1 Real.

### 2️⃣ Contas de teste

```bash
Usuário: testebankop1@gmail.com
Senha: 123456
```
```bash
Usuário: testebankop2@gmail.com
Senha: 123456
```

### 3️⃣ Funcionalidades do Painel Principal

Conversão de Pontos: Troque OpCoins por Reais.

Transferência: Envie OpCoins ou Reais para outros usuários.

Histórico: Veja todas as transações feitas e recebidas.


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
  "user": {
    "name": "João",
    "email": "joao@email.com"
  },
  "access_token": "token_jwt"
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
  "user": {
    "name": "João",
    "email": "joao@email.com"
  },
  "access_token": "<token_jwt>"
}
```

### Carteiras

GET /wallets - Retorna as carteiras do usuário autenticado

**Headers:**
```bash
Authorization: Bearer <token_jwt>
```

**Resposta:**
```bash
  {
    "id": "<uuid_code>",
    "userId": "<uuid_code>",
    "coinId": "<uuid_code>",
    "balance": "4500",
    "createdAt": "<Date>",
    "updatedAt": "<Date>",
    "coin": {
      "id": "<uuid_code>",
      "symbol": "OPCOIN",
      "name": "Op Coin",
      "createdAt": "<Date>",
      "updatedAt": "<Date>"
    }
  }
```

PATCH /wallets/convert - Converte moedas do usuário autenticado

**Headers:**
```bash
Authorization: Bearer <token_jwt>
```

**Body:**
```bash
{
  "OpCoins": 100
}
```

**Resposta:**
```bash
  {
    "updatedOpCoinBalance": "1000",
    "updatedBRLCoinBalance": "1000",
    "newTransaction": {
      [
        {
            "id": "<uuid_code>",
            "fromCoinId": "<uuid_code>",
            "toCoinId": "<uuid_code>",
            "amountFrom": "100",
            "amountTo": "20",
            "userId": "<uuid_code>",
            "typeId": "<uuid_code>",
            "userFromId": "<uuid_code>",
            "userToId": "<uuid_code>",
            "createdAt": "<Date>",
            "updatedAt": "<Date>",
            "type": {
                "id": "<uuid_code>",
                "type": "CONVERT",
                "description": "Conversão"
            },
            "fromCoin": {
                "id": "<uuid_code>",
                "symbol": "OPCOIN",
                "name": "Op Coin"
            },
            "toCoin": {
                "id": "<uuid_code>",
                "symbol": "BRL",
                "name": "Real Brasileiro"
            },
            "userFrom": {
                "id": "<uuid_code>",
                "name": "João",
                "email": "joao@email.com"
            },
            "userTo": {
                "id": "<uuid_code>",
                "name": "João",
                "email": "joao@email.com"
            }
        }
      ]
    }
  }
```

POST /wallets/transfer - Transferência entre usuários

**Headers:**
```bash
Authorization: Bearer <token_jwt>
```

**Body:**
```bash
{
  "email": "maria@email.com",
  "amountCoin": "OPCOIN",
  "amount": 100
}
```

**Resposta:**
```bash
  {
    "newBalance": "1000",
    "amount": "1000",
    "amountCoin": "OPCOIN",
    "newTransaction": {
      [
        {
            "id": "<uuid_code>",
            "fromCoinId": "<uuid_code>",
            "toCoinId": "<uuid_code>",
            "amountFrom": "100",
            "amountTo": "0",
            "userId": "<uuid_code>",
            "typeId": "<uuid_code>",
            "userFromId": "<uuid_code>",
            "userToId": "<uuid_code>",
            "createdAt": "<Date>",
            "updatedAt": "<Date>",
            "type": {
                "id": "<uuid_code>",
                "type": "TRANSFER",
                "description": "Transferência"
            },
            "fromCoin": {
                "id": "<uuid_code>",
                "symbol": "OPCOIN",
                "name": "Op Coin"
            },
            "toCoin": {
                "id": "<uuid_code>",
                "symbol": "OPCOIN",
                "name": "Op Coin"
            },
            "userFrom": {
                "id": "<uuid_code>",
                "name": "João",
                "email": "joao@email.com"
            },
            "userTo": {
                "id": "<uuid_code>",
                "name": "Maria",
                "email": "maria@email.com"
            }
        }
      ]
    }
  }
```

### Transações
GET /transactions - Retorna histórico de transações do usuário autenticado

**Headers:**
```bash
Authorization: Bearer <token_jwt>
```

**Resposta:**
```bash
  {
    [
      {
          "id": "<uuid_code>",
          "fromCoinId": "<uuid_code>",
          "toCoinId": "<uuid_code>",
          "amountFrom": "100",
          "amountTo": "0",
          "userId": "<uuid_code>",
          "typeId": "<uuid_code>",
          "userFromId": "<uuid_code>",
          "userToId": "<uuid_code>",
          "createdAt": "<Date>",
          "updatedAt": "<Date>",
          "type": {
              "id": "<uuid_code>",
              "type": "TRANSFER",
              "description": "Transferência"
          },
          "fromCoin": {
              "id": "<uuid_code>",
              "symbol": "OPCOIN",
              "name": "Op Coin"
          },
          "toCoin": {
              "id": "<uuid_code>",
              "symbol": "OPCOIN",
              "name": "Op Coin"
          },
          "userFrom": {
              "id": "<uuid_code>",
              "name": "João",
              "email": "joao@email.com"
          },
          "userTo": {
              "id": "<uuid_code>",
              "name": "Maria",
              "email": "maria@email.com"
          }
      }
    ]
  }
```


## 💡 Decisões Técnicas

- NestJS Framework: Escolhido por sua arquitetura modular e suporte nativo a TypeScript
- Prisma: ORM type-safe com autocompletar inteligente, migrations versionadas e geração automática de tipos para o PostgreSQL
- PostgreSQL: Banco relacional para garantia de ACID nas transações financeiras
- JWT Stateless: Autenticação sem sessão para escalabilidade

---

## License

[MIT](https://choosealicense.com/licenses/mit/)
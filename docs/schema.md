# Schema do banco de dados

Diagrama entidade-relacionamento simplificado (alguns campos omitidos por
brevidade — o schema completo está em `prisma/schema.prisma`).

```mermaid
erDiagram
    User ||--o{ Account : possui
    User ||--o{ Card : possui
    User ||--o{ Category : possui
    User ||--o{ Transaction : registra
    User ||--o{ Goal : define
    User ||--o{ Investment : possui
    User ||--o{ Budget : define
    User ||--o{ RecurringSubscription : assina
    User ||--o{ Notification : recebe
    User ||--o{ AuditLog : gera
    User ||--o{ ImportBatch : importa
    User }o--|| Household : "pertence a (opcional)"

    Account ||--o{ Transaction : origem
    Card ||--o{ Transaction : origem
    Card ||--o{ Installment : possui
    Category ||--o{ Transaction : classifica
    Category ||--o{ Budget : limita

    Transaction }o--|| Installment : "faz parte de (opcional)"
    Transaction }o--|| RecurringSubscription : "gerada por (opcional)"
    Transaction ||--o{ Attachment : anexos

    User {
        string id PK
        string email UK
        string passwordHash
        Role role
        string currency
        string householdId FK
    }

    Household {
        string id PK
        string name
    }

    Account {
        string id PK
        string userId FK
        AccountType type
        Decimal initialBalance
    }

    Card {
        string id PK
        string userId FK
        CardBrand brand
        Decimal limit
        int closingDay
        int dueDay
    }

    Category {
        string id PK
        string userId FK
        string name
        Decimal monthlyBudget
    }

    Transaction {
        string id PK
        string userId FK
        string categoryId FK
        string accountId FK
        string cardId FK
        string installmentId FK
        string subscriptionId FK
        Decimal amount
        TransactionType type
        DateTime date
        boolean isRecurring
        boolean isInstallment
    }

    Installment {
        string id PK
        string cardId FK
        Decimal totalAmount
        int totalCount
        int paidCount
    }

    RecurringSubscription {
        string id PK
        string userId FK
        Decimal amount
        RecurrenceFrequency frequency
        DateTime nextChargeDate
    }

    Goal {
        string id PK
        string userId FK
        Decimal targetAmount
        Decimal currentAmount
        GoalStatus status
    }

    Investment {
        string id PK
        string userId FK
        InvestmentType type
        Decimal investedAmount
        Decimal currentAmount
    }

    Budget {
        string id PK
        string userId FK
        string categoryId FK
        Decimal limit
        BudgetPeriod period
    }

    AuditLog {
        string id PK
        string userId FK
        string entity
        string entityId
        AuditAction action
        Json before
        Json after
    }
```

## Decisões de modelagem que valem revisitar

- **Cascade vs. SetNull**: relações "pertence a" (ex: `Transaction.userId`) usam
  `Cascade` — apagar o usuário apaga tudo dele. Relações "classificado por" (ex:
  `Transaction.categoryId`) usam `SetNull` — apagar a categoria não apaga o
  histórico de transações, só remove a classificação.
- **Decimal, nunca Float**: todo valor monetário é `Decimal(14,2)` (ou
  `Decimal(18,8)` para quantidade de ativos como cripto). Evita erro de
  arredondamento acumulado em somas.
- **Enums para todo domínio fechado**: `Role`, `AccountType`, `CardBrand`,
  `InvestmentType`, `TransactionType`, `GoalStatus`, `BudgetPeriod`,
  `RecurrenceFrequency`, `ImportSource`, `ImportStatus`, `NotificationType`,
  `AuditAction` — nunca strings soltas para esses campos.
- **`Household` já existe, mas está subutilizado**: o campo existe desde a
  Etapa 2 para suportar controle financeiro compartilhado entre membros da
  família, mas o fluxo de convite/aceite de membros não foi construído (ver
  "Próximos passos" no README, Etapa 9).

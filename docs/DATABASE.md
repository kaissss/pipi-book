# PiPiBook — Database Documentation

## Technology

- **Database**: PostgreSQL 16 (hosted on Supabase free tier)
- **ORM**: Prisma 5 with TypeScript client generation
- **Schema file**: `backend/prisma/schema.prisma`

---

## Entity Relationship Diagram (ERD)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │       │    coaches       │       │   services   │
│──────────────│       │──────────────────│       │──────────────│
│ id (PK)      │ 1   1 │ id (PK)          │ 1   N │ id (PK)      │
│ lineUserId   ├───────┤ userId (FK)      │       │ coachId (FK) │
│ displayName  │       │ slug (UNIQUE)    ├───────┤ name         │
│ pictureUrl   │       │ bio              │       │ description  │
│ role         │       │ timezone         │       │ durationMin  │
│ createdAt    │       │ isActive         │       │ price        │
│ updatedAt    │       │ createdAt        │       │ currency     │
└──────┬───────┘       └──────────────────┘       │ isActive     │
       │                                           │ createdAt    │
       │ 1                                         └──────┬───────┘
       │                                                  │
       │ N                                                │ 1
┌──────▼───────┐       ┌──────────────────┐       ┌──────▼───────┐
│   bookings   │       │availability_rules│       │  time_slots  │
│──────────────│       │──────────────────│       │──────────────│
│ id (PK)      │       │ id (PK)          │       │ id (PK)      │
│ coachId (FK) │       │ coachId (FK)     │       │ serviceId(FK)│
│ clientId(FK) │       │ dayOfWeek (0-6)  │       │ coachId (FK) │
│ serviceId(FK)│       │ startTime        │       │ startsAt     │
│ slotId (FK)  │       │ endTime          │       │ endsAt       │
│ status       │       │ isActive         │       │ isBooked     │
│ totalAmount  │       └──────────────────┘       │ createdAt    │
│ currency     │                                   └──────────────┘
│ ecpayOrderId │
│ paidAt       │       ┌──────────────────┐
│ cancelledAt  │       │    payments      │
│ notes        │       │──────────────────│
│ createdAt    │ 1   1 │ id (PK)          │
│ updatedAt    ├───────┤ bookingId (FK)   │
└──────────────┘       │ provider         │
                       │ providerOrderId  │
                       │ amount           │
                       │ currency         │
                       │ status           │
                       │ rawResponse(JSON)│
                       │ createdAt        │
                       └──────────────────┘
```

---

## Table Descriptions

### `users`
Stores all authenticated users (coaches and clients share this table, differentiated by `role`).

| Column        | Type        | Notes                                              |
|---------------|-------------|----------------------------------------------------|
| id            | UUID PK     | `gen_random_uuid()`                                |
| lineUserId    | VARCHAR     | Unique LINE user ID from OAuth profile             |
| displayName   | VARCHAR     | LINE display name                                  |
| pictureUrl    | TEXT        | LINE profile picture URL                           |
| role          | ENUM        | `CLIENT` or `COACH`                               |
| createdAt     | TIMESTAMPTZ |                                                    |
| updatedAt     | TIMESTAMPTZ |                                                    |

### `coaches`
Extended profile for coach users. One-to-one with `users`.

| Column    | Type    | Notes                                                     |
|-----------|---------|-----------------------------------------------------------|
| id        | UUID PK |                                                           |
| userId    | UUID FK | References `users.id` (unique)                            |
| slug      | VARCHAR | URL-safe unique identifier e.g. `john-yoga`               |
| bio       | TEXT    | Markdown-supported coach bio                              |
| timezone  | VARCHAR | IANA timezone string e.g. `Asia/Taipei`                   |
| isActive  | BOOLEAN | Whether the booking page is publicly accessible           |

### `services`
Bookable service types offered by a coach (e.g. "60-min Personal Training").

| Column      | Type    | Notes                          |
|-------------|---------|--------------------------------|
| durationMin | INT     | Session length in minutes      |
| price       | DECIMAL | 10,2 precision                 |
| currency    | VARCHAR | Default `TWD`                  |

### `availability_rules`
Weekly recurring availability windows set by the coach.

| Column     | Type    | Notes                                        |
|------------|---------|----------------------------------------------|
| dayOfWeek  | INT     | 0 = Sunday … 6 = Saturday                   |
| startTime  | TIME    | e.g. `09:00:00`                              |
| endTime    | TIME    | e.g. `17:00:00`                              |

### `time_slots`
Concrete bookable slots generated from availability rules (or manually added). Slots are pre-generated on a rolling window (e.g. 4 weeks ahead) by a scheduled job.

| Column    | Type        | Notes                                         |
|-----------|-------------|-----------------------------------------------|
| startsAt  | TIMESTAMPTZ | Slot start (stored as UTC)                    |
| endsAt    | TIMESTAMPTZ | Slot end (stored as UTC)                      |
| isBooked  | BOOLEAN     | Set to true when a confirmed booking exists   |

### `bookings`
Central booking record linking client, coach, service, and slot.

| Column      | Type    | Notes                                               |
|-------------|---------|-----------------------------------------------------|
| status      | ENUM    | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `REFUNDED` |
| totalAmount | DECIMAL | Amount charged (copied from service.price at booking time) |
| ecpayOrderId| VARCHAR | Merchant trade number sent to ECPay                 |
| paidAt      | TIMESTAMPTZ | Set when ECPay return confirms payment           |

### `payments`
Immutable payment audit log. One booking can have multiple payment records (e.g. original charge + refund).

| Column         | Type | Notes                                        |
|----------------|------|----------------------------------------------|
| provider       | ENUM | `ECPAY`                                      |
| status         | ENUM | `PENDING`, `SUCCEEDED`, `FAILED`, `REFUNDED` |
| rawResponse    | JSON | Full ECPay callback payload stored as-is     |

---

## Prisma Schema (conceptual)

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // used for migrations (Supabase requires this)
}

enum Role {
  CLIENT
  COACH
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

model User {
  id          String   @id @default(uuid()) @db.Uuid
  lineUserId  String   @unique
  displayName String
  pictureUrl  String?
  role        Role     @default(CLIENT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  coach       Coach?
  bookings    Booking[] @relation("ClientBookings")
}

model Coach {
  id        String  @id @default(uuid()) @db.Uuid
  userId    String  @unique @db.Uuid
  slug      String  @unique
  bio       String?
  timezone  String  @default("Asia/Taipei")
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user              User               @relation(fields: [userId], references: [id])
  services          Service[]
  availabilityRules AvailabilityRule[]
  timeSlots         TimeSlot[]
  bookings          Booking[]          @relation("PiPiBookings")
}

model Service {
  id          String  @id @default(uuid()) @db.Uuid
  coachId     String  @db.Uuid
  name        String
  description String?
  durationMin Int
  price       Decimal @db.Decimal(10, 2)
  currency    String  @default("TWD")
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())

  coach     Coach      @relation(fields: [coachId], references: [id])
  timeSlots TimeSlot[]
  bookings  Booking[]
}

model AvailabilityRule {
  id         String  @id @default(uuid()) @db.Uuid
  coachId    String  @db.Uuid
  dayOfWeek  Int     // 0-6
  startTime  String  // "HH:MM"
  endTime    String
  isActive   Boolean @default(true)

  coach Coach @relation(fields: [coachId], references: [id])
}

model TimeSlot {
  id        String   @id @default(uuid()) @db.Uuid
  coachId   String   @db.Uuid
  serviceId String   @db.Uuid
  startsAt  DateTime
  endsAt    DateTime
  isBooked  Boolean  @default(false)
  createdAt DateTime @default(now())

  coach   Coach    @relation(fields: [coachId], references: [id])
  service Service  @relation(fields: [serviceId], references: [id])
  booking Booking?

  @@index([coachId, startsAt])
  @@index([coachId, isBooked, startsAt])
}

model Booking {
  id           String        @id @default(uuid()) @db.Uuid
  coachId      String        @db.Uuid
  clientId     String        @db.Uuid
  serviceId    String        @db.Uuid
  slotId       String        @unique @db.Uuid
  status       BookingStatus @default(PENDING)
  totalAmount  Decimal       @db.Decimal(10, 2)
  currency     String        @default("TWD")
  ecpayOrderId String?       @unique
  paidAt       DateTime?
  cancelledAt  DateTime?
  notes        String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  coach    Coach    @relation("PiPiBookings",  fields: [coachId],  references: [id])
  client   User     @relation("ClientBookings", fields: [clientId], references: [id])
  service  Service  @relation(fields: [serviceId], references: [id])
  slot     TimeSlot @relation(fields: [slotId],    references: [id])
  payment  Payment?

  @@index([coachId, status])
  @@index([clientId])
  @@index([ecpayOrderId])
}

model Payment {
  id              String        @id @default(uuid()) @db.Uuid
  bookingId       String        @unique @db.Uuid
  provider        String        @default("ECPAY")
  providerOrderId String?
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("TWD")
  status          PaymentStatus @default(PENDING)
  rawResponse     Json?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  booking Booking @relation(fields: [bookingId], references: [id])
}
```

---

## Migration Workflow

```bash
# Create a new migration (development)
npx prisma migrate dev --name descriptive_name

# Apply migrations (production / CI)
npx prisma migrate deploy

# Open Prisma Studio (GUI for the DB)
npx prisma studio

# Reset dev DB (drops all data)
npx prisma migrate reset
```

> **Supabase note**: Set both `DATABASE_URL` (transaction pooler, port 6543) and `DIRECT_URL` (direct connection, port 5432) in your environment. Prisma uses `DIRECT_URL` for migrations and `DATABASE_URL` for runtime queries.

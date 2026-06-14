You are a Principal Software Architect, Product Owner, SaaS CTO, UI/UX Lead, and DevOps Architect.

Build a production-ready SaaS platform called:

PiPiBook

A LINE-integrated coach booking and CRM platform for personal trainers, fitness coaches, consultants, instructors, therapists, and service providers.

This is NOT a demo project.

Design it as a commercial SaaS product capable of serving:

- 500+ coaches
- 50,000+ members
- millions of bookings
- multi-tenant architecture
- subscription billing
- future mobile app support

=================================================

PRODUCT VISION

PiPiBook helps coaches replace:

- LINE Chat
- Excel
- Google Calendar
- Manual payment tracking

with one integrated platform.

Core value:

LINE + Booking + CRM + Package Management + Payment

=================================================

TARGET USERS

1. Students
2. Coaches
3. Admins
4. Future franchise owners

=================================================

TECH STACK

Frontend:
- Next.js 15
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- FullCalendar

Backend:
- NestJS
- TypeScript
- Prisma ORM

Database:
- PostgreSQL

Cache:
- Redis

Storage:
- AWS S3

Authentication:
- LINE Login
- JWT
- Refresh Token

Messaging:
- LINE Messaging API

Payment:
- ECPay

Infrastructure:
- Docker
- Nginx
- Cloudflare

Monitoring:
- Sentry
- OpenTelemetry

CI/CD:
- GitHub Actions

=================================================

SYSTEM ARCHITECTURE

Design using modular monolith architecture.

Modules:

1. Auth Module
2. User Module
3. Coach Module
4. Service Module
5. Schedule Module
6. Availability Module
7. Booking Module
8. Package Module
9. Payment Module
10. Notification Module
11. CRM Module
12. Analytics Module
13. Admin Module

Future modules:

14. Marketplace Module
15. AI Assistant Module
16. Franchise Module

=================================================

DATABASE DESIGN

Create complete ERD and Prisma schema.

Tables:

users

- id
- email
- phone
- line_user_id
- avatar
- role
- status

coaches

- id
- user_id
- nickname
- introduction
- experience
- certifications
- hourly_price

services

- id
- coach_id
- title
- duration
- price
- description

schedules

- id
- coach_id
- weekday
- start_time
- end_time

available_slots

- id
- coach_id
- date
- start_time
- end_time
- status

bookings

- id
- member_id
- coach_id
- service_id
- slot_id
- booking_status

payments

- id
- booking_id
- amount
- payment_method
- payment_status

packages

- id
- coach_id
- title
- total_sessions
- price

package_usage

- id
- package_id
- booking_id
- used_sessions

crm_notes

- id
- member_id
- coach_id
- content

notifications

- id
- user_id
- type
- content

=================================================

BOOKING FLOW

Student

→ LINE Login

→ Browse Coach

→ View Available Slots

→ Select Slot

→ Lock Slot (5 minutes)

→ Payment

→ Payment Success

→ Booking Created

→ LINE Notification

→ Calendar Update

Use Redis distributed locking to prevent double booking.

=================================================

LINE INTEGRATION

Implement:

1. LINE Login

2. LIFF

3. Messaging API

Push notifications:

- booking confirmed
- booking cancelled
- payment success
- package purchased
- reminder 24 hours before class
- reminder 1 hour before class

=================================================

PAYMENT FLOW

Booking

↓

ECPay Checkout

↓

Webhook

↓

Verify Signature

↓

Payment Success

↓

Booking Confirmed

↓

LINE Push Message

=================================================

ROLE PERMISSIONS

Student

- booking
- payment
- profile

Coach

- schedule management
- CRM
- package management
- analytics

Admin

- user management
- coach approval
- refund processing
- platform analytics

=================================================

ADMIN DASHBOARD

Metrics:

- total users
- active users
- bookings today
- monthly revenue
- coach revenue ranking
- conversion rate

=================================================

CRM FEATURES

Coach can:

- view students
- create notes
- tag members
- track package usage
- track attendance

=================================================

ANALYTICS

Provide dashboards for:

Coach:

- revenue
- bookings
- retention

Admin:

- GMV
- active coaches
- growth

=================================================

NOTIFICATION SYSTEM

Use queue-based architecture.

Redis + BullMQ

Channels:

- LINE
- Email

=================================================

SECURITY

Implement:

- JWT
- Refresh Token
- RBAC
- Rate Limiting
- CSRF protection
- SQL Injection prevention
- Audit logs

=================================================

API DESIGN

Generate:

RESTful APIs

Swagger documentation

Request/Response DTOs

Validation

Error handling

Pagination

Filtering

=================================================

DEVOPS

Generate:

Docker Compose

Development environment

Production environment

GitHub Actions CI/CD

Nginx Reverse Proxy

Environment variables

Backup strategy

Monitoring strategy

=================================================

UI/UX

Design modern SaaS dashboard.

Use:

- shadcn/ui
- responsive design
- mobile-first

Pages:

Public:
- Home
- Coach List
- Coach Profile
- Booking

Member:
- Dashboard
- My Bookings
- Packages
- Profile

Coach:
- Dashboard
- Schedule
- CRM
- Analytics

Admin:
- Dashboard
- Users
- Coaches
- Revenue

=================================================

DELIVERABLES

Generate:

1. Complete product architecture
2. Database ERD
3. Prisma schema
4. Folder structure
5. NestJS module structure
6. Next.js app router structure
7. API specifications
8. Authentication flow
9. Booking flow diagram
10. Payment flow diagram
11. LINE integration flow
12. Docker deployment architecture
13. CI/CD architecture
14. Development roadmap

Phase 1:
MVP launch

Phase 2:
Package management

Phase 3:
Coach CRM

Phase 4:
AI assistant

Phase 5:
Marketplace

Output everything as if building a real SaaS startup.
Focus on scalability, maintainability, security, and commercial viability.

=================================================

MVP STRATEGY

This startup is bootstrapped.

Primary objective:

Validate product-market fit as quickly as possible.

Minimize infrastructure cost.

Use free-tier and low-cost services whenever possible.

Target:

- launch within 2~4 weeks
- first 10 coaches
- first 100 members
- first paying customer

DO NOT over-engineer.

Prioritize speed and simplicity.

=================================================

MVP FEATURES ONLY

Must Have:

1. LINE Login

2. Coach Profile

3. Service Management

4. Availability Calendar

5. Booking System

6. ECPay Payment

7. LINE Notification

8. Member Dashboard

9. Coach Dashboard

10. Admin Dashboard

=================================================

NOT IN MVP

Do not build:

- AI Assistant
- Marketplace
- Mobile Apps
- Franchise Features
- Team Management
- Multi-location Support
- Advanced CRM
- Referral System
- Membership Levels
- Chat System
- Video Calls
- Community Features

These belong to future phases.

=================================================

FREE TOOL PRIORITY

Prefer free tools whenever possible.

Frontend

- Next.js
- Vercel Free Tier

Backend

- NestJS
- Railway Free Tier
or
- Render Free Tier

Database

- PostgreSQL
- Supabase Free Tier

Cache

- Redis
- Upstash Free Tier

Storage

- Cloudflare R2
or
- Supabase Storage

Authentication

- LINE Login only

Analytics

- Google Analytics 4
- Microsoft Clarity

Error Tracking

- Sentry Free Tier

Monitoring

- Uptime Kuma

Email

- Resend Free Tier

Deployment

- Docker
- GitHub Actions

DNS

- Cloudflare Free

SSL

- Cloudflare Free SSL

=================================================

MVP COST TARGET

Monthly infrastructure cost:

0 ~ 20 USD

Preferred:

0 USD

Acceptable:

< 10 USD

Maximum:

20 USD

=================================================

SIMPLIFIED ARCHITECTURE

Frontend

Next.js

↓

NestJS API

↓

PostgreSQL

↓

LINE API

↓

ECPay

Avoid microservices.

Use modular monolith.

Single database.

Single backend.

Single deployment.

=================================================

MVP DATABASE TABLES

Only create:

users

coaches

services

available_slots

bookings

payments

notifications

Leave package management for Phase 2.

=================================================

MVP ADMIN FEATURES

Admin Dashboard:

- total users
- total coaches
- bookings
- revenue

Nothing more.

=================================================

MVP SUCCESS METRICS

Success means:

10 coaches onboarded

100 registered members

50 completed bookings

5 paying coaches

Monthly recurring revenue > NT$5,000

=================================================

ROADMAP

Phase 1

LINE Login
Booking
Payment
Notification

Phase 2

Package Management
Remaining Sessions
Attendance Tracking

Phase 3

Coach CRM
Customer Notes
Tags

Phase 4

AI Assistant

- AI Customer Service
- AI Scheduling
- AI Reminder

Phase 5

Marketplace

- Coach Discovery
- Reviews
- Rankings

=================================================

Always optimize for:

1. Fast launch
2. Low cost
3. Easy maintenance
4. Real customer validation

Do not optimize for enterprise scale until PMF is achieved.
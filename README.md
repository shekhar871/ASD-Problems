# ASD-Problems

InstaLite backend — three progressive labs building a full Prisma + Express API.

| Folder | Lab | What's inside |
|--------|-----|---------------|
| `problem-1/` | Prisma Client + CRUD | Express server, Prisma setup, full CRUD for User and Post (MVC: routes → controllers → services) |
| `problem-2/` | Seeding, Filtering, Sorting & Pagination | Seed script, paginated + sorted + filtered GET /users and GET /posts |
| `problem-3/` | Relations | One-to-many (User→Post), many-to-many (Like), cascading deletes, likes endpoints, bonus liked-posts |

## Setup

```bash
cd problem-X
cp .env.example .env   # fill in your DATABASE_URL
npm install
npx prisma migrate dev
npm run seed           # (problem-2 and problem-3 only)
npm start
```

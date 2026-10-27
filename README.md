# ASD-Problems

cd problem-X
cp .env.example .env   # fill in your DATABASE_URL
npm install
npx prisma migrate dev
npm run seed           # (problem-2 and problem-3 only)
npm start


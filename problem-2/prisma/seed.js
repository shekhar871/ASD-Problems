const prisma = require("../src/db");
const { users, posts } = require("./seed-data");

async function seed() {
  try {
    // delete all posts first, then users
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // create all users
    const createdUsers = await prisma.user.createManyAndReturn({
      data: users.map((u) => ({
        ...u,
        createdAt: new Date(u.createdAt),
      })),
    });

    // create all posts
    const createdPosts = await prisma.post.createManyAndReturn({
      data: posts.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      })),
    });

    console.log(
      `🌱 Seeded ${createdUsers.length} users and ${createdPosts.length} posts`
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

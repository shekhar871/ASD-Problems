const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

async function seed() {
  try {
    // delete children first, then parents
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // create all users and get them back with their ids
    const createdUsers = await prisma.user.createManyAndReturn({
      data: users.map((u) => ({
        username: u.username,
        email: u.email,
        fullname: u.fullname,
        bio: u.bio,
        isPrivate: u.isPrivate,
        createdAt: new Date(u.createdAt),
      })),
    });

    // build a username -> id lookup
    const userMap = new Map(createdUsers.map((u) => [u.username, u.id]));

    // create all posts - replace author with real authorId
    const createdPosts = await prisma.post.createManyAndReturn({
      data: posts.map((p) => ({
        imageUrl: p.imageUrl,
        caption: p.caption,
        location: p.location,
        authorId: userMap.get(p.author),
        createdAt: new Date(p.createdAt),
      })),
    });

    // build an insta## -> post id lookup
    // imageUrl looks like: https://picsum.photos/seed/insta01/600/600
    const postMap = new Map(
      createdPosts.map((p) => {
        const key = p.imageUrl.split("/")[5]; // insta01, insta02, etc.
        return [key, p.id];
      })
    );

    // create all likes with real userIds and postIds
    const createdLikes = await prisma.like.createManyAndReturn({
      data: likes.map((l) => ({
        userId: userMap.get(l.user),
        postId: postMap.get(l.post),
      })),
    });

    console.log(
      `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.length} likes`
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

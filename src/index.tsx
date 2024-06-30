import { Hono } from 'hono';
import { jwt, sign, verify } from 'hono/jwt';
import { setCookie } from 'hono/cookie';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import Lists from './Lists';
import Uploader from './Uploader';
import Login from './Login';

type Bindings = {
  MY_BUCKET: R2Bucket;
  MY_JWT_SECRET: string;
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/auth/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.MY_JWT_SECRET,
    cookie: 'auth_token',
  });
  return jwtMiddleware(c, next);
});

// html
// uploader
app.get('/', async (c) => {
  return c.html(<Uploader />);
});

// login
app.get('/login', async (c) => {
  return c.html(<Login />);
});

// lists
app.get('/list', async (c) => {
  const res = await c.env.MY_BUCKET.list();
  return c.html(<Lists list={res.objects} />);
});

app.post('/login', async (c, next) => {
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });

  const body = await c.req.formData();
  const email = body.get('email');
  const password = body.get('password');
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return c.json({ user });

  if (user) {
    const payload = {
      sub: user.id,
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 60 * 120, // Token expires in 5 minutes
    };
    const secret = c.env.MY_JWT_SECRET;
    const token = await sign(payload, secret);
    await setCookie(c, 'auth_token', token, {
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
    });
    return c.redirect('/');
  } else {
    return c.json({ error: 'Invalid username or password' }, 401);
  }
});

app.post('/auth/upload', async (c, next) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;
  if (!file) {
    return c.json({ error: 'No file uploaded' }, 400);
  }
  const fileName = `${Date.now()}-${file.name}`;
  await c.env.MY_BUCKET.put(fileName, file);
  return c.text(
    `Put https://memos-assets.leoho.dev/${fileName} successfully!`
  );
});

export default app;

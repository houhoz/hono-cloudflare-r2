import { Hono } from 'hono';
import { jwt, sign } from 'hono/jwt';
import { setCookie } from 'hono/cookie';
import List from './list';

type Bindings = {
  MY_BUCKET: R2Bucket;
  MY_JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/auth/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.MY_JWT_SECRET,
    cookie: 'auth_token',
  });
  return jwtMiddleware(c, next);
});

const View = () => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
      </head>
      <body>
        <form
          action="/auth/upload"
          method="post"
          enctype="multipart/form-data"
        >
          <label
            for="cover-photo"
            class="block text-sm font-medium leading-6 text-gray-900"
          >
            Cover photo
          </label>
          <div class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
            <div class="text-center">
              <svg
                class="mx-auto h-12 w-12 text-gray-300"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  for="file"
                  class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file"
                    name="file"
                    type="file"
                    class="sr-only"
                  />
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs leading-5 text-gray-600">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
          <button
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            type="submit"
          >
            upload
          </button>
        </form>
      </body>
    </html>
  );
};

app.get('/', async (c) => {
  return c.html(<View />);
});

const Login = () => {
  return (
    <html class="h-full bg-white">
      <header>
        <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
      </header>
      <body class="h-full">
        <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
          <div class="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              class="mx-auto h-10 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
              alt="Your Company"
            />
            <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form class="space-y-6" action="/login" method="POST">
              <div>
                <label
                  for="username"
                  class="block text-sm font-medium leading-6 text-gray-900"
                >
                  Username
                </label>
                <div class="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autocomplete="username"
                    required
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between">
                  <label
                    for="password"
                    class="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  <div class="text-sm">
                    <a
                      href="#"
                      class="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
                <div class="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>

            <p class="mt-10 text-center text-sm text-gray-500">
              Not a member?
              <a
                href="#"
                class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                Start a 14 day free trial
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

app.get('/login', (c) => {
  return c.html(<Login />);
});
app.get('/list', async (c) => {
  const res = await c.env.MY_BUCKET.list();
  return c.html(<List list={res.objects} />);
});

app.post('/login', async (c, next) => {
  const body = await c.req.formData();
  const usename = body.get('username');
  const password = body.get('password');
  if (usename === 'admin' && password === '123456') {
    const payload = {
      sub: 'admin',
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

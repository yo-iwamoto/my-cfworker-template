import { Hono } from 'hono';
import { validator } from 'hono/validator';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  BUCKET_PUBLIC_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
  const stmt = c.env.DB.prepare(`SELECT * FROM comments LIMIT 10`);
  const { results: comments } = await stmt.all<{
    id: number;
    content: string;
    image_key: string | null;
  }>();

  return c.html(
    <main>
      <h1>Comments</h1>

      {comments.length > 0 ? (
        <ul style={{ listStyle: 'none' }}>
          {comments.map((comment) => (
            <li key={comment.id}>
              {comment.image_key !== null ? (
                <img
                  height={200}
                  width={200}
                  src={`${c.env.BUCKET_PUBLIC_URL}/comments/${comment.id}/${comment.image_key}`}
                  style={{ objectFit: 'cover' }}
                />
              ) : null}
              <p>{comment.content}</p>

              <form action={`/comments/${comment.id}/delete`} method='post'>
                <button type='submit'>Delete</button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comment yet</p>
      )}

      <form action='/comments' method='post' enctype='multipart/form-data'>
        <textarea
          rows={5}
          style={{ width: 500 }}
          name='content'
          required
          autofocus
        />
        <input type='file' name='image' accept='image/*' />
        <button type='submit'>Post</button>
      </form>
    </main>,
  );
});

app.post('/comments/:id/delete', async (c) => {
  const { id } = c.req.param();
  const result = await c.env.DB.prepare(`DELETE FROM comments WHERE id = ?`)
    .bind(id)
    .run();
  if (result.error !== undefined) {
    return c.json({ message: 'Internal Server Error' }, 500);
  }

  return c.redirect('/');
});

app.post(
  '/comments',
  validator('form', (value, c) => {
    const { content, image } = value;
    if (typeof content !== 'string') {
      return c.text('content must be a string');
    }

    if (image !== '' && !(image instanceof File)) {
      return c.text('image must be a file');
    }

    return {
      content,
      image,
    };
  }),
  async (c) => {
    const { content, image } = c.req.valid('form');

    const res = await c.env.DB.prepare(
      `INSERT INTO comments (content, image_key) VALUES (?, ?) RETURNING id`,
    )
      .bind(content, image instanceof File ? image.name : null)
      .first<{ id: number }>();
    if (res === null) {
      return c.json({ message: 'Internal Server Error' }, 500);
    }

    if (image instanceof File) {
      const putResult = await c.env.BUCKET.put(
        `comments/${res.id}/${image.name}`,
        image,
      );
      console.log(putResult);
      if (putResult === null) {
        return c.json({ message: 'Internal Server Error' }, 500);
      }
    }

    return c.redirect('/');
  },
);

export default app;

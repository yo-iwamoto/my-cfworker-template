import { Hono } from 'hono';
import { validator } from 'hono/validator';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
  const stmt = c.env.DB.prepare(`SELECT * FROM comments LIMIT 10`);
  const { results: comments } = await stmt.all();

  return c.html(
    <main>
      <h1>Comments</h1>

      {comments.length > 0 ? (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>{comment.content}</li>
          ))}
        </ul>
      ) : (
        <p>No comment yet</p>
      )}

      <form action='/comments' method='POST'>
        <input type='text' name='content' required autofocus />
        <button type='submit'>Post</button>
      </form>
    </main>,
  );
});

app.post(
  '/comments',
  validator('form', (value, c) => {
    const content = value['content'];
    if (typeof content !== 'string') {
      return c.text('Invalid request', 400);
    }

    return {
      content,
    };
  }),
  async (c) => {
    const { content } = c.req.valid('form');

    await c.env.DB.prepare(`INSERT INTO comments (content) VALUES (?)`)
      .bind(content)
      .run();

    return c.redirect('/');
  },
);

export default app;

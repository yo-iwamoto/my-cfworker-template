# my-cfworker-template

<img src="https://github.com/you-5805/my-cfworker-template/assets/56625097/f185c456-756d-4a08-828f-455a9e04bea1" alt="ブラウザでWebアプリケーションを操作する様子のキャプチャ。「Hello Cloudflare!」というテキストと画像を投稿すると、ページがロードされてそのコメントが表示される。「pong!」というコメントを投稿して表示された後、それぞれの「Delete」ボタンをクリックして投稿を削除している。" width="800" />


```bash
# install
bun i

# dev
bun run dev

# deploy
bun run deploy
```

## D1

```bash
# create
# and you should first change the names on package.json, wrangler.toml
bun wrangler d1 create {name}

# run migration
bun run d1:migrate

# run migration (on local)
bun run d1:migrate --local
```

## R2

```bash
# create
# and you should first change the name on wrangler.toml
bun wrangler r2 bucket create {name}
```

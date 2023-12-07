# my-cfworker-template

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

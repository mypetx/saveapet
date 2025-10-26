# My Petx — MVP

Backend: Elixir + Phoenix (minimal)

To run locally:

1. Install Elixir/Erlang.
2. Get deps:

```bash
mix deps.get
```

3. Start the server (recommended):

Use the included helper script which loads `.env`, runs DB create/migrate and starts the app:

```bash
./scripts/start.sh
```

Or do the steps manually (ensure you export the `.env` values into the shell first):

```bash
# in zsh/bash
set -a; source .env; set +a
MIX_ENV=dev mix ecto.create
MIX_ENV=dev mix ecto.migrate
MIX_ENV=dev mix run --no-halt
```

The SPA is served from `priv/static/index.html` and the API is under `/api`.

Using PostgreSQL (local)

1. Install PostgreSQL (Homebrew example):

```bash
brew install postgresql
brew services start postgresql
```

2. Create DB user/database (defaults used by the app):

```bash
# create DB and user if needed
createdb perdi_meu_pet_dev || true
# (optional) create user if you prefer custom credentials
createuser -s postgres || true
```

3. Create DB and run migrations via Ecto (from project root):

```bash
mix ecto.create
mix ecto.migrate
```

4. Start the server:

```bash
MIX_ENV=dev mix run --no-halt
```

If you want to use custom credentials, edit `.env` or export environment variables before starting. The `.env` file in the repo is a convenience; if you prefer not to use it, export these variables manually:

```bash
export PGUSER=myuser
export PGPASSWORD=mypass
export PGDATABASE=perdi_meu_pet_dev
export PGHOST=localhost
export PGPORT=5432
```


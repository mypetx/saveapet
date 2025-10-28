# 🚀 Guia de Deploy para Produção - SaveAPet

## Opção 1: Deploy no Fly.io (Recomendado - Gratuito)

### Passo 1: Instalar Fly CLI
```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### Passo 2: Fazer Login no Fly.io
```bash
fly auth login
```

### Passo 3: Criar um PostgreSQL no Fly.io
```bash
fly postgres create --name saveapet-db --region gru
```

### Passo 4: Gerar Secret Key
```bash
mix phx.gen.secret
# Copie o resultado (você vai usar nos próximos passos)
```

### Passo 5: Configurar Variáveis de Ambiente
```bash
# Defina o SECRET_KEY_BASE (use o valor gerado no passo anterior)
fly secrets set SECRET_KEY_BASE="cole_aqui_o_secret_gerado"

# Defina o JWT_SECRET
fly secrets set JWT_SECRET="cole_aqui_outro_secret"

# Conecte o banco de dados
fly postgres attach saveapet-db
```

### Passo 6: Deploy!
```bash
fly deploy
```

### Passo 7: Executar Migrations
```bash
fly ssh console -C "/app/bin/perdi_meu_pet eval 'PerdiMeuPet.Release.migrate'"
```

Ou crie um módulo de release primeiro:

```bash
# Criar lib/perdi_meu_pet/release.ex
```

### Passo 8: Abrir o App
```bash
fly open
```

### Comandos Úteis:
```bash
# Ver logs
fly logs

# Ver status
fly status

# Escalar recursos
fly scale vm shared-cpu-1x --memory 512

# Criar banco de dados manualmente
fly ssh console -C "/app/bin/perdi_meu_pet eval 'PerdiMeuPet.Release.create'"
```

---

## Opção 2: Deploy no Render (Também Gratuito)

### Passo 1: Criar conta no Render
Acesse: https://render.com

### Passo 2: Criar PostgreSQL Database
1. Clique em "New" → "PostgreSQL"
2. Nome: `saveapet-db`
3. Plano: Free
4. Copie a "Internal Database URL"

### Passo 3: Criar Web Service
1. Clique em "New" → "Web Service"
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: saveapet
   - **Environment**: Elixir
   - **Build Command**: `mix deps.get --only prod && mix compile && mix assets.deploy`
   - **Start Command**: `mix phx.server`

### Passo 4: Adicionar Variáveis de Ambiente
```
DATABASE_URL = [Cole a Internal Database URL]
SECRET_KEY_BASE = [Gere com: mix phx.gen.secret]
JWT_SECRET = [Gere outro: mix phx.gen.secret]
MIX_ENV = prod
PHX_HOST = saveapet.onrender.com
PORT = 10000
POOL_SIZE = 2
```

---

## Opção 3: Gigalixir (Específico para Elixir)

```bash
# Instalar CLI
pip3 install gigalixir

# Login
gigalixir login

# Criar app
gigalixir create -n saveapet

# Adicionar banco PostgreSQL
gigalixir pg:create --free

# Configurar secrets
gigalixir config:set SECRET_KEY_BASE="$(mix phx.gen.secret)"
gigalixir config:set JWT_SECRET="$(mix phx.gen.secret)"

# Deploy
git push gigalixir main

# Executar migrations
gigalixir run mix ecto.migrate
```

---

## Opção 4: Railway (Muito Fácil)

1. Acesse https://railway.app
2. Faça login com GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecione o repositório saveapet
5. Adicione PostgreSQL: "New" → "Database" → "PostgreSQL"
6. Configure variáveis de ambiente no painel
7. Deploy automático!

---

## Configurações Adicionais Necessárias

### 1. Criar Release Module (para migrations automáticas)
Crie o arquivo `lib/perdi_meu_pet/release.ex`:

```elixir
defmodule PerdiMeuPet.Release do
  @moduledoc false
  @app :perdi_meu_pet

  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def rollback(repo, version) do
    load_app()
    {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end
```

### 2. Adicionar script de inicialização no Dockerfile
O Dockerfile já está configurado!

### 3. Configurar CORS para domínio de produção
No arquivo `lib/perdi_meu_pet_web/router.ex`, ajuste:

```elixir
plug CORSPlug, origin: ["https://saveapet.fly.dev", "https://www.saveapet.com"]
```

---

## Checklist Antes do Deploy

- [ ] Gerar SECRET_KEY_BASE: `mix phx.gen.secret`
- [ ] Gerar JWT_SECRET: `mix phx.gen.secret`
- [ ] Configurar DATABASE_URL em produção
- [ ] Testar build local: `MIX_ENV=prod mix release`
- [ ] Verificar se porta está configurada (8080 ou 4000)
- [ ] Configurar domínio personalizado (opcional)
- [ ] Configurar SSL/HTTPS (automático no Fly.io e Render)
- [ ] Executar migrations após deploy
- [ ] Testar cadastro e login

---

## Custos Estimados

| Plataforma | CPU | RAM | Storage | Custo/Mês |
|------------|-----|-----|---------|-----------|
| **Fly.io** | Shared | 256MB | 3GB | **Gratuito** |
| **Render** | Shared | 512MB | - | **Gratuito** |
| **Railway** | Shared | 512MB | 1GB | **$5 crédito grátis** |
| **Gigalixir** | 1 | 200MB | - | **Gratuito** |

---

## Recomendação Final

Para **começar rápido e grátis**: Use **Fly.io**
- ✅ Mais fácil de configurar
- ✅ CLI poderosa
- ✅ PostgreSQL incluído
- ✅ SSL automático
- ✅ Região Brasil (GRU)

Execute:
```bash
fly launch
fly postgres attach saveapet-db
fly deploy
```

Pronto! 🎉

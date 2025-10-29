defmodule PerdiMeuPet.Application do
  # OTP Application for PerdiMeuPet
  use Application

  require Logger

  def start(_type, _args) do
    children = [
      {Phoenix.PubSub, name: PerdiMeuPet.PubSub},
      PerdiMeuPet.Repo,
      PerdiMeuPetWeb.Endpoint,
      PerdiMeuPet.Scheduler
    ]

    # Garante que o diretório de uploads existe
    uploads_dir = if File.dir?("/data") do
      "/data/uploads"  # Produção: volume persistente
    else
      Path.expand("priv/static/uploads", File.cwd!())  # Desenvolvimento
    end
    File.mkdir_p!(uploads_dir)
    Logger.info("Uploads directory: #{uploads_dir}")

    opts = [strategy: :one_for_one, name: PerdiMeuPet.Supervisor]
    Logger.info("Starting PerdiMeuPet Application")
    {:ok, pid} = Supervisor.start_link(children, opts)

    # Run migrations automatically (idempotent - safe to run multiple times)
    try do
      Logger.info("Running database migrations...")
      PerdiMeuPet.Release.migrate()
      Logger.info("Migrations completed successfully")
    rescue
      e ->
        Logger.warning("Migrations check: #{inspect(e)}")
    end

    {:ok, pid}
  end

  def config_change(changed, _new, removed) do
    PerdiMeuPetWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end

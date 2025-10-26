defmodule PerdiMeuPet.Application do
  # OTP Application for PerdiMeuPet
  use Application

  require Logger

  def start(_type, _args) do
    children = [
      {Phoenix.PubSub, name: PerdiMeuPet.PubSub},
      PerdiMeuPet.Repo,
      PerdiMeuPetWeb.Endpoint
    ]

    # ensure uploads dir
    uploads = Path.expand("priv/static/uploads", File.cwd!())
    File.mkdir_p!(uploads)

    opts = [strategy: :one_for_one, name: PerdiMeuPet.Supervisor]
    Logger.info("Starting PerdiMeuPet Application")
    {:ok, pid} = Supervisor.start_link(children, opts)

    # Run Ecto migrations on startup (priv/repo/migrations)
    path = Application.app_dir(:perdi_meu_pet, "priv/repo/migrations")
    try do
      Ecto.Migrator.with_repo(PerdiMeuPet.Repo, fn repo ->
        Ecto.Migrator.run(repo, path, :up, all: true)
      end)
    rescue
      e in [Ecto.MigrationError, Exqlite.Error] ->
        IO.puts("[warn] migrations skipped or partially applied: #{inspect(e)}")
    end

    {:ok, pid}
  end

  def config_change(changed, _new, removed) do
    PerdiMeuPetWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end

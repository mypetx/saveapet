import Config

config :perdi_meu_pet, ecto_repos: [PerdiMeuPet.Repo]

config :perdi_meu_pet, PerdiMeuPet.Repo,
  username:
    System.get_env("PGUSER") || System.get_env("DB_USER") || System.get_env("USER") || "postgres",
  password: System.get_env("PGPASSWORD") || System.get_env("DB_PASS") || "",
  database: System.get_env("PGDATABASE") || System.get_env("DB_NAME") || "perdi_meu_pet_dev",
  hostname: System.get_env("PGHOST") || System.get_env("DB_HOST") || "localhost",
  port: String.to_integer(System.get_env("PGPORT") || System.get_env("DB_PORT") || "5432"),
  pool_size: String.to_integer(System.get_env("DB_POOL") || "10")

config :perdi_meu_pet, PerdiMeuPetWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: System.get_env("SECRET_KEY_BASE") || "dev_secret_change_me",
  http: [ip: {0,0,0,0}, port: 3333],
  server: true,
  render_errors: [view: PerdiMeuPetWeb.ErrorView, accepts: ["json"]],
  pubsub_server: PerdiMeuPet.PubSub,
  live_view: [signing_salt: "change_me"]

config :logger, :console, format: "$time $metadata[$level] $message\n"

config :phoenix, :json_library, Jason

config :perdi_meu_pet, :jwt_secret, System.get_env("JWT_SECRET") || "dev-jwt-secret"

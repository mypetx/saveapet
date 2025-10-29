import Config

# Runtime configuration (loaded when the app starts, not at compile time)

if config_env() == :prod do
  # Use SQLite in production (simpler for this project)
  config :perdi_meu_pet, PerdiMeuPet.Repo,
    database: "/data/perdi_meu_pet.db",
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "5")

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "saveapet.fly.dev"
  port = String.to_integer(System.get_env("PORT") || "8080")

  config :perdi_meu_pet, PerdiMeuPetWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base,
    server: true

  config :perdi_meu_pet, :jwt_secret, System.get_env("JWT_SECRET") || secret_key_base
end

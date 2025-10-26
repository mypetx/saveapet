defmodule PerdiMeuPetWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :perdi_meu_pet

  plug Plug.Static,
    at: "/",
    from: :perdi_meu_pet,
    gzip: false,
    only: ~w(css fonts images js uploads favicon.ico robots.txt index.html)

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head

  plug CORSPlug, origin: "*"
  plug PerdiMeuPetWeb.Router
end

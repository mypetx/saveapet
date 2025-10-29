defmodule PerdiMeuPet.Repo do
  use Ecto.Repo,
    otp_app: :perdi_meu_pet,
    adapter: Ecto.Adapters.SQLite3
end

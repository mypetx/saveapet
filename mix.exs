defmodule PerdiMeuPet.MixProject do
  use Mix.Project

  def project do
    [
      app: :perdi_meu_pet,
      version: "0.1.0",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      elixirc_paths: elixirc_paths(Mix.env()),
      releases: [
        perdi_meu_pet: [
          include_executables_for: [:unix],
          applications: [runtime_tools: :permanent]
        ]
      ]
    ]
  end

  def application do
    [
      mod: {PerdiMeuPet.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:phoenix, "~> 1.7.9"},
      {:phoenix_pubsub, "~> 2.1"},
      {:phoenix_html, "~> 3.3"},
  {:plug_cowboy, "~> 2.6"},
  {:cors_plug, "~> 3.0"},
      {:jason, "~> 1.4"},
  {:ecto_sql, "~> 3.9"},
  {:postgrex, ">= 0.0.0"},
  {:ecto_sqlite3, "~> 0.11"},
      {:bcrypt_elixir, "~> 3.0"},
      {:joken, "~> 2.4"}
    ]
  end
end

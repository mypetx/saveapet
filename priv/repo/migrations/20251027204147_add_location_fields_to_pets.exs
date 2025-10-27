defmodule PerdiMeuPet.Repo.Migrations.AddLocationFieldsToPets do
  use Ecto.Migration

  def change do
    alter table(:pets) do
      add :city, :string
      add :state, :string
      add :country, :string
    end

    create index(:pets, [:city])
  end
end

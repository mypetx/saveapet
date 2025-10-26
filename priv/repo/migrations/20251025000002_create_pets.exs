defmodule PerdiMeuPet.Repo.Migrations.CreatePets do
  use Ecto.Migration

  def change do
    create table(:pets) do
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :name, :string
      add :species, :string
      add :breed, :string
      add :color, :string
      add :status, :string
      add :description, :text
      add :photo_url, :string
      add :last_seen_lat, :float
      add :last_seen_lng, :float
      add :date_lost, :date

      timestamps()
    end

    create index(:pets, [:user_id])
    create index(:pets, [:status])
  end
end

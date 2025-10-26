defmodule PerdiMeuPet.Repo.Migrations.CreateComments do
  use Ecto.Migration

  def change do
    create table(:comments) do
      add :body, :text, null: false
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :pet_id, references(:pets, on_delete: :delete_all), null: false

      timestamps()
    end

    create index(:comments, [:pet_id])
    create index(:comments, [:user_id])
  end
end

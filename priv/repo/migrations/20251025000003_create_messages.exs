defmodule PerdiMeuPet.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :from_user_id, references(:users, on_delete: :delete_all), null: false
      add :to_user_id, references(:users, on_delete: :delete_all), null: false
      add :pet_id, references(:pets, on_delete: :nilify_all)
      add :message, :text

      timestamps()
    end

    create index(:messages, [:from_user_id])
    create index(:messages, [:to_user_id])
    create index(:messages, [:pet_id])
  end
end

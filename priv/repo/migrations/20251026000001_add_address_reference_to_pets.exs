defmodule PerdiMeuPet.Repo.Migrations.AddAddressReferenceToPets do
  use Ecto.Migration

  def change do
    alter table(:pets) do
      add :address, :string
      add :reference, :string
    end
  end
end

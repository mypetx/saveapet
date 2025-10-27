defmodule PerdiMeuPet.Pets do
  alias PerdiMeuPet.Repo
  alias PerdiMeuPet.Pets.Pet

  import Ecto.Query, warn: false

  def list_pets(_opts \\ []) do
    Repo.all(
      from p in Pet,
      order_by: [desc: p.inserted_at],
      preload: [:user]
    )
  end

  def get_pet!(id) do
    Repo.get!(Pet, id) |> Repo.preload(:user)
  end

  def create_pet(attrs) do
    %Pet{}
    |> Pet.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, pet} -> {:ok, Repo.preload(pet, :user)}
      error -> error
    end
  end

  def update_pet(%Pet{} = pet, attrs) do
    pet
    |> Pet.changeset(attrs)
    |> Repo.update()
    |> case do
      {:ok, pet} -> {:ok, Repo.preload(pet, :user)}
      error -> error
    end
  end

  def delete_pet(%Pet{} = pet) do
    Repo.delete(pet)
  end
end

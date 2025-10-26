defmodule PerdiMeuPet.Pets do
  alias PerdiMeuPet.Repo
  alias PerdiMeuPet.Pets.Pet

  import Ecto.Query, warn: false

  def list_pets(_opts \\ []) do
    Repo.all(from p in Pet, order_by: [desc: p.inserted_at])
  end

  def get_pet!(id), do: Repo.get!(Pet, id)

  def create_pet(attrs) do
    %Pet{}
    |> Pet.changeset(attrs)
    |> Repo.insert()
  end
end

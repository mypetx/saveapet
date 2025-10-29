defmodule PerdiMeuPet.Pets.Pet do
  use Ecto.Schema
  import Ecto.Changeset

  schema "pets" do
    field :name, :string
    field :species, :string
    field :breed, :string
    field :color, :string
    field :status, :string
    field :description, :string
    field :photo_url, :string
    field :last_seen_lat, :float
    field :last_seen_lng, :float
    field :date_lost, :date
    field :address, :string
    field :reference, :string
    field :city, :string
    field :state, :string
    field :country, :string

    belongs_to :user, PerdiMeuPet.Accounts.User

    timestamps()
  end

  def changeset(pet, attrs) do
    pet
    |> cast(attrs, [:user_id, :name, :species, :breed, :color, :status, :description, :photo_url, :last_seen_lat, :last_seen_lng, :date_lost, :address, :reference, :city, :state, :country])
    |> validate_required([:user_id, :status])
  end
end

# Custom JSON encoder to include owner contact information
defimpl Jason.Encoder, for: PerdiMeuPet.Pets.Pet do
  def encode(pet, opts) do
    # Include owner email and phone if loaded
    owner_contact = if pet.user do
      %{
        owner_name: pet.user.name,
        owner_email: pet.user.email,
        owner_phone: pet.user.phone
      }
    else
      %{}
    end

    base_map = %{
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      color: pet.color,
      status: pet.status,
      last_seen_lat: pet.last_seen_lat,
      last_seen_lng: pet.last_seen_lng,
      date_lost: pet.date_lost,
      description: pet.description,
      photo_url: pet.photo_url,
      address: pet.address,
      reference: pet.reference,
      city: pet.city,
      state: pet.state,
      country: pet.country,
      user_id: pet.user_id,
      inserted_at: pet.inserted_at,
      updated_at: pet.updated_at
    }

    Jason.Encode.map(Map.merge(base_map, owner_contact), opts)
  end
end

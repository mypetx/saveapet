defmodule PerdiMeuPet.Pets.Pet do
  use Ecto.Schema
  @derive {Jason.Encoder, only: [:id, :name, :species, :breed, :color, :status, :last_seen_lat, :last_seen_lng, :date_lost, :description, :photo_url, :address, :reference, :user_id, :inserted_at, :updated_at]}
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

    belongs_to :user, PerdiMeuPet.Accounts.User

    timestamps()
  end

  def changeset(pet, attrs) do
    pet
    |> cast(attrs, [:user_id, :name, :species, :breed, :color, :status, :description, :photo_url, :last_seen_lat, :last_seen_lng, :date_lost, :address, :reference])
    |> validate_required([:user_id, :status])
  end
end

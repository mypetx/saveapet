defmodule PerdiMeuPet.Messages.Message do
  use Ecto.Schema
  @derive {Jason.Encoder, only: [:id, :from_user_id, :to_user_id, :pet_id, :message, :inserted_at]}
  import Ecto.Changeset

  schema "messages" do
    field :message, :string
    belongs_to :from_user, PerdiMeuPet.Accounts.User
    belongs_to :to_user, PerdiMeuPet.Accounts.User
    belongs_to :pet, PerdiMeuPet.Pets.Pet

    timestamps()
  end

  def changeset(msg, attrs) do
    msg
    |> cast(attrs, [:from_user_id, :to_user_id, :pet_id, :message])
    |> validate_required([:from_user_id, :to_user_id, :message])
  end
end

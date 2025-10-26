defmodule PerdiMeuPet.Comments.Comment do
  use Ecto.Schema
  @derive {Jason.Encoder, only: [:id, :body, :user_id, :pet_id, :inserted_at]}
  import Ecto.Changeset

  schema "comments" do
    field :body, :string
    belongs_to :user, PerdiMeuPet.Accounts.User
    belongs_to :pet, PerdiMeuPet.Pets.Pet

    timestamps()
  end

  def changeset(comment, attrs) do
    comment
    |> cast(attrs, [:body, :user_id, :pet_id])
    |> validate_required([:body, :user_id, :pet_id])
  end
end

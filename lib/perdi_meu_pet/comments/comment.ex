defmodule PerdiMeuPet.Comments.Comment do
  use Ecto.Schema
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

# Custom JSON encoder para incluir o nome do usuário
defimpl Jason.Encoder, for: PerdiMeuPet.Comments.Comment do
  def encode(comment, opts) do
    user_name = if comment.user, do: comment.user.name, else: "Usuário #{comment.user_id}"

    # Verifica se o comentário foi editado (updated_at diferente de inserted_at)
    edited = comment.updated_at &&
             NaiveDateTime.compare(comment.updated_at, comment.inserted_at) == :gt

    Jason.Encode.map(
      %{
        id: comment.id,
        body: comment.body,
        user_id: comment.user_id,
        user_name: user_name,
        pet_id: comment.pet_id,
        inserted_at: comment.inserted_at,
        updated_at: comment.updated_at,
        edited: edited
      },
      opts
    )
  end
end

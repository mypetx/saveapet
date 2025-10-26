defmodule PerdiMeuPet.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :name, :string
    field :email, :string
    field :phone, :string
    field :city, :string
    field :password_hash, :string

    # virtual
    field :password, :string, virtual: true

    timestamps()
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :phone, :city, :password])
    |> validate_required([:email])
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email)
    |> put_pass_hash()
  end

  defp put_pass_hash(changeset) do
    case get_change(changeset, :password) do
      nil -> changeset
      pass -> put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(pass))
    end
  end
end

defmodule PerdiMeuPet.Accounts do
  alias PerdiMeuPet.Repo
  alias PerdiMeuPet.Accounts.User

  import Ecto.Query, warn: false

  def get_user!(id), do: Repo.get!(User, id)

  def get_by_email(email) do
    Repo.get_by(User, email: email)
  end

  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  def verify_password(user, password) do
    if user && Bcrypt.verify_pass(password, user.password_hash) do
      {:ok, user}
    else
      :error
    end
  end
end

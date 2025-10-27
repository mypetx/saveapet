defmodule PerdiMeuPetWeb.AuthController do
  use Phoenix.Controller

  alias PerdiMeuPet.Accounts

  action_fallback PerdiMeuPetWeb.FallbackController

  def register(conn, %{"email" => email, "password" => password} = params) do
    attrs = %{
      "name" => Map.get(params, "name"),
      "email" => email,
      "phone" => Map.get(params, "phone"),
      "city" => Map.get(params, "city"),
      "password" => password
    }

    case Accounts.create_user(attrs) do
      {:ok, user} ->
        case PerdiMeuPetWeb.Token.generate(%{id: user.id, email: user.email}) do
          {:ok, token} ->
            json(conn, %{token: token, user: %{id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city}})
          {:error, reason} ->
            conn |> put_status(500) |> json(%{error: "token_error", details: inspect(reason)})
        end

      {:error, changeset} ->
        conn
        |> put_status(400)
        |> json(%{error: "invalid data", details: Ecto.Changeset.traverse_errors(changeset, fn {msg, _opts} -> msg end)})
    end
  end

  def login(conn, %{"email" => email, "password" => password}) do
    case Accounts.get_by_email(email) do
      nil -> conn |> put_status(401) |> json(%{error: "invalid credentials"})
      user ->
        case Accounts.verify_password(user, password) do
          {:ok, _} ->
            case PerdiMeuPetWeb.Token.generate(%{id: user.id, email: user.email}) do
              {:ok, token} -> json(conn, %{token: token, user: %{id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city}})
              {:error, reason} -> conn |> put_status(500) |> json(%{error: "token_error", details: inspect(reason)})
            end

          :error -> conn |> put_status(401) |> json(%{error: "invalid credentials"})
        end
    end
  end

  def me(conn, _params) do
    user = conn.assigns[:current_user]
    json(conn, %{user: %{id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city}})
  end

  def update(conn, params) do
    user = conn.assigns[:current_user]
    if user do
      attrs = Map.take(params, ["name", "phone", "city", "password", "email"])
      case PerdiMeuPet.Accounts.update_user(user, attrs) do
        {:ok, user} -> json(conn, %{user: %{id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city}})
        {:error, changeset} -> conn |> put_status(400) |> json(%{error: "invalid data", details: Ecto.Changeset.traverse_errors(changeset, fn {msg, _} -> msg end)})
      end
    else
      conn |> put_status(401) |> json(%{error: "unauthenticated"})
    end
  end
end

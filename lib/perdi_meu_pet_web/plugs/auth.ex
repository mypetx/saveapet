defmodule PerdiMeuPetWeb.Plugs.Auth do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, claims} <- PerdiMeuPetWeb.Token.verify(token) do
      # fetch user by id from claims if present
      user =
        case claims["id"] do
          nil -> nil
          id ->
            # use Ecto to fetch user row (works with Postgres)
            case PerdiMeuPet.Repo.get(PerdiMeuPet.Accounts.User, id) do
              nil -> nil
              u -> %{id: u.id, name: u.name, email: u.email, phone: u.phone, city: u.city}
            end
        end

      conn |> assign(:current_user, user)
    else
      _ -> conn |> send_resp(401, "unauthenticated") |> halt()
    end
  end
end

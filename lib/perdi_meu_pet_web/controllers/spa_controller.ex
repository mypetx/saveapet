defmodule PerdiMeuPetWeb.SpaController do
  use Phoenix.Controller

  def index(conn, _params) do
    conn
    |> put_resp_content_type("text/html")
    |> send_file(200, Path.join(:code.priv_dir(:perdi_meu_pet) |> to_string(), "static/index.html"))
  end
end

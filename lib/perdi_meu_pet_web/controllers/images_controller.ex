defmodule PerdiMeuPetWeb.ImagesController do
  use Phoenix.Controller

  def logo(conn, _params) do
    # serve the logo from project root imgs/logo.png so authors don't need to copy it
    logo_path = Path.expand("imgs/logo.png", File.cwd!())

    if File.exists?(logo_path) do
      conn
      |> put_resp_header("cache-control", "public, max-age=86400")
      |> send_file(200, logo_path)
    else
      send_resp(conn, 404, "logo not found")
    end
  end
end

defmodule PerdiMeuPetWeb.ImagesController do
  use Phoenix.Controller

  def serve(conn, %{"filename" => filename}) do
    # Serve images from priv/static/imgs
    imgs_path = Path.join([:code.priv_dir(:perdi_meu_pet), "static", "imgs", filename])

    if File.exists?(imgs_path) do
      # Get content type based on file extension
      content_type = case Path.extname(filename) do
        ".png" -> "image/png"
        ".jpg" -> "image/jpeg"
        ".jpeg" -> "image/jpeg"
        ".gif" -> "image/gif"
        ".svg" -> "image/svg+xml"
        ".ico" -> "image/x-icon"
        _ -> "application/octet-stream"
      end

      conn
      |> put_resp_header("content-type", content_type)
      |> put_resp_header("cache-control", "public, max-age=86400")
      |> send_file(200, imgs_path)
    else
      send_resp(conn, 404, "Image not found")
    end
  end
end

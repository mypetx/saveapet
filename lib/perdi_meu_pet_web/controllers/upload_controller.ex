defmodule PerdiMeuPetWeb.UploadController do
  use Phoenix.Controller

  @doc """
  Serve images from the uploads directory.
  """
  def serve(conn, %{"filename" => filename}) do
    # Prevent path traversal attacks
    safe_filename = Path.basename(filename)

    uploads_dir = get_uploads_dir()
    file_path = Path.join(uploads_dir, safe_filename)

    if File.exists?(file_path) do
      content_type = get_content_type(file_path)
      conn
      |> put_resp_content_type(content_type)
      |> send_file(200, file_path)
    else
      send_resp(conn, 404, "Image not found")
    end
  end

  defp get_content_type(file_path) do
    case Path.extname(file_path) |> String.downcase() do
      ".png" -> "image/png"
      ".jpg" -> "image/jpeg"
      ".jpeg" -> "image/jpeg"
      ".gif" -> "image/gif"
      ".webp" -> "image/webp"
      _ -> "application/octet-stream"
    end
  end

  # Returns the uploads directory (persistent volume in production)
  defp get_uploads_dir do
    if File.dir?("/data") do
      "/data/uploads"
    else
      Path.join([:code.priv_dir(:perdi_meu_pet) |> to_string(), "static", "uploads"])
    end
  end
end

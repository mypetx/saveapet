defmodule PerdiMeuPetWeb.PetsController do
  use Phoenix.Controller

  alias PerdiMeuPet.Pets

  action_fallback PerdiMeuPetWeb.FallbackController

  def index(conn, _params) do
    pets = Pets.list_pets()
    json(conn, %{pets: pets})
  end

  def my_pets(conn, _params) do
    user = conn.assigns[:current_user]

    if user == nil do
      conn |> put_status(401) |> json(%{error: "unauthenticated"})
    else
      pets = Pets.list_pets_by_user(user.id)
      json(conn, %{pets: pets})
    end
  end

  def show(conn, %{"id" => id}) do
    pet = Pets.get_pet!(id)
    json(conn, %{pet: pet})
  end

  def create(conn, params) do
    user = conn.assigns[:current_user]

    if user == nil do
      conn |> put_status(401) |> json(%{error: "unauthenticated"})
    else
      # handle optional photo upload
      attrs = Map.put(params, "user_id", user.id)

      attrs = case Map.get(params, "photo") do
        %Plug.Upload{} = upload ->
          uploads_dir = get_uploads_dir()
          ext = Path.extname(upload.filename || "")
          filename = "pet_#{:erlang.unique_integer([:positive])}#{ext}"
          dest = Path.join(uploads_dir, filename)

          case File.cp(upload.path, dest) do
            :ok ->
              # Compress image to save storage space
              {:ok, _compressed_path} = PerdiMeuPet.ImageCompressor.compress(dest)
              Map.put(attrs, "photo_url", "/uploads/#{filename}")

            {:error, reason} ->
              # log and continue without photo
              IO.warn("failed to copy upload: #{inspect(reason)}")
              attrs
          end

        _ -> attrs
      end

      case Pets.create_pet(attrs) do
        {:ok, pet} -> json(conn, %{pet: pet})
        {:error, changeset} -> conn |> put_status(400) |> json(%{error: "invalid data", details: Ecto.Changeset.traverse_errors(changeset, fn {msg, _} -> msg end)})
      end
    end
  end

  def update(conn, %{"id" => id} = params) do
    user = conn.assigns[:current_user]

    if user == nil do
      conn |> put_status(401) |> json(%{error: "unauthenticated"})
    else
      pet = Pets.get_pet!(id)

      # Verify that the pet belongs to the current user
      if pet.user_id != user.id do
        conn |> put_status(403) |> json(%{error: "forbidden"})
      else
        # Handle optional photo upload
        attrs = case Map.get(params, "photo") do
          %Plug.Upload{} = upload ->
            uploads_dir = get_uploads_dir()
            ext = Path.extname(upload.filename || "")
            filename = "pet_#{:erlang.unique_integer([:positive])}#{ext}"
            dest = Path.join(uploads_dir, filename)

            case File.cp(upload.path, dest) do
              :ok ->
                # Compress image to save storage space
                {:ok, _compressed_path} = PerdiMeuPet.ImageCompressor.compress(dest)
                Map.put(params, "photo_url", "/uploads/#{filename}")

              {:error, reason} ->
                IO.warn("failed to copy upload: #{inspect(reason)}")
                params
            end

          _ -> params
        end

        # Remove id, user_id, and photo from update attrs (photo already converted to photo_url)
        attrs = Map.drop(attrs, ["id", "user_id", "photo"])

        case Pets.update_pet(pet, attrs) do
          {:ok, pet} -> json(conn, %{pet: pet})
          {:error, changeset} -> conn |> put_status(400) |> json(%{error: "invalid data", details: Ecto.Changeset.traverse_errors(changeset, fn {msg, _} -> msg end)})
        end
      end
    end
  end

  def delete(conn, %{"id" => id}) do
    user = conn.assigns[:current_user]

    if user == nil do
      conn |> put_status(401) |> json(%{error: "unauthenticated"})
    else
      pet = Pets.get_pet!(id)

      # Verify that the pet belongs to the current user
      if pet.user_id != user.id do
        conn |> put_status(403) |> json(%{error: "forbidden"})
      else
        # Remove the image before deleting the pet
        if pet.photo_url do
          delete_pet_image(pet.photo_url)
        end

        case Pets.delete_pet(pet) do
          {:ok, _pet} -> json(conn, %{success: true})
          {:error, changeset} -> conn |> put_status(400) |> json(%{error: "delete failed", details: Ecto.Changeset.traverse_errors(changeset, fn {msg, _} -> msg end)})
        end
      end
    end
  end

  # Remove image file from disk
  defp delete_pet_image(photo_url) do
    filename = Path.basename(photo_url)
    uploads_dir = get_uploads_dir()
    file_path = Path.join(uploads_dir, filename)

    if File.exists?(file_path) do
      File.rm(file_path)
    end
  end

  # Returns the uploads directory (persistent volume in production)
  defp get_uploads_dir do
    if File.dir?("/data") do
      # Production: uses persistent volume mounted at /data
      uploads_dir = "/data/uploads"
      File.mkdir_p!(uploads_dir)
      uploads_dir
    else
      # Development: uses priv/static/uploads
      uploads_dir = Path.join([:code.priv_dir(:perdi_meu_pet) |> to_string(), "static", "uploads"])
      File.mkdir_p!(uploads_dir)
      uploads_dir
    end
  end
end

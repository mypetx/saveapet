defmodule PerdiMeuPet.Pets.Cleaner do
  @moduledoc """
  Module responsible for automatically cleaning old posts.
  Removes posts older than 90 days and their respective images.
  """

  require Logger
  alias PerdiMeuPet.Repo
  alias PerdiMeuPet.Pets.Pet
  import Ecto.Query

  @days_to_keep 90

  @doc """
  Removes posts older than 90 days and their images.
  Returns the number of posts removed.
  """
  def clean_old_posts do
    cutoff_date = DateTime.utc_now() |> DateTime.add(-@days_to_keep, :day)

    Logger.info("Starting cleanup of old posts (before #{cutoff_date})")

    # Fetch old posts
    old_pets =
      from(p in Pet,
        where: p.inserted_at < ^cutoff_date,
        select: p
      )
      |> Repo.all()

    count = length(old_pets)

    if count > 0 do
      Logger.info("Found #{count} posts to remove")

      # Remove each post and its image
      Enum.each(old_pets, fn pet ->
        delete_pet_with_image(pet)
      end)

      Logger.info("✓ Cleanup completed: #{count} posts removed")
    else
      Logger.info("✓ No old posts found")
    end

    count
  end

  # Remove a pet and its associated image
  defp delete_pet_with_image(pet) do
    # Remove the image if it exists
    if pet.photo_url do
      delete_image(pet.photo_url)
    end

    # Remove the pet from database
    case Repo.delete(pet) do
      {:ok, _} ->
        Logger.debug("Post removed: #{pet.name} (ID: #{pet.id})")
        :ok

      {:error, reason} ->
        Logger.error("Error removing post #{pet.id}: #{inspect(reason)}")
        :error
    end
  end

  # Remove image file from disk
  defp delete_image(photo_url) do
    # Extract filename from URL (ex: "/uploads/pet_123.jpg" -> "pet_123.jpg")
    filename = Path.basename(photo_url)

    # Build complete path
    uploads_dir = get_uploads_dir()
    file_path = Path.join(uploads_dir, filename)

    # Remove the file if it exists
    if File.exists?(file_path) do
      case File.rm(file_path) do
        :ok ->
          Logger.debug("Image removed: #{filename}")
          :ok

        {:error, reason} ->
          Logger.warning("Error removing image #{filename}: #{inspect(reason)}")
          :error
      end
    else
      Logger.debug("Image not found: #{filename}")
      :ok
    end
  end

  # Returns the uploads directory (persistent volume in production)
  defp get_uploads_dir do
    if File.dir?("/data") do
      # Production: uses persistent volume mounted at /data
      "/data/uploads"
    else
      # Development: uses priv/static/uploads
      Path.join([
        :code.priv_dir(:perdi_meu_pet) |> to_string(),
        "static",
        "uploads"
      ])
    end
  end

  @doc """
  Returns the number of days a post will be kept before automatic deletion.
  """
  def days_to_keep, do: @days_to_keep
end

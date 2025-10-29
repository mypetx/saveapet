defmodule PerdiMeuPet.Pets.Cleaner do
  @moduledoc """
  Módulo responsável por limpar posts antigos automaticamente.
  Remove posts com mais de 90 dias e suas respectivas imagens.
  """

  require Logger
  alias PerdiMeuPet.Repo
  alias PerdiMeuPet.Pets.Pet
  import Ecto.Query

  @days_to_keep 90

  @doc """
  Remove posts com mais de 90 dias e suas imagens.
  Retorna o número de posts removidos.
  """
  def clean_old_posts do
    cutoff_date = DateTime.utc_now() |> DateTime.add(-@days_to_keep, :day)

    Logger.info("Iniciando limpeza de posts antigos (antes de #{cutoff_date})")

    # Busca posts antigos
    old_pets =
      from(p in Pet,
        where: p.inserted_at < ^cutoff_date,
        select: p
      )
      |> Repo.all()

    count = length(old_pets)

    if count > 0 do
      Logger.info("Encontrados #{count} posts para remover")

      # Remove cada post e sua imagem
      Enum.each(old_pets, fn pet ->
        delete_pet_with_image(pet)
      end)

      Logger.info("✓ Limpeza concluída: #{count} posts removidos")
    else
      Logger.info("✓ Nenhum post antigo encontrado")
    end

    count
  end

  # Remove um pet e sua imagem associada
  defp delete_pet_with_image(pet) do
    # Remove a imagem se existir
    if pet.photo_url do
      delete_image(pet.photo_url)
    end

    # Remove o pet do banco
    case Repo.delete(pet) do
      {:ok, _} ->
        Logger.debug("Post removido: #{pet.name} (ID: #{pet.id})")
        :ok

      {:error, reason} ->
        Logger.error("Erro ao remover post #{pet.id}: #{inspect(reason)}")
        :error
    end
  end

  # Remove arquivo de imagem do disco
  defp delete_image(photo_url) do
    # Extrai o nome do arquivo da URL (ex: "/uploads/pet_123.jpg" -> "pet_123.jpg")
    filename = Path.basename(photo_url)

    # Monta o caminho completo
    uploads_dir = get_uploads_dir()
    file_path = Path.join(uploads_dir, filename)

    # Remove o arquivo se existir
    if File.exists?(file_path) do
      case File.rm(file_path) do
        :ok ->
          Logger.debug("Imagem removida: #{filename}")
          :ok

        {:error, reason} ->
          Logger.warning("Erro ao remover imagem #{filename}: #{inspect(reason)}")
          :error
      end
    else
      Logger.debug("Imagem não encontrada: #{filename}")
      :ok
    end
  end

  # Retorna o diretório de uploads (volume persistente em produção)
  defp get_uploads_dir do
    if File.dir?("/data") do
      # Produção: usa volume persistente montado em /data
      "/data/uploads"
    else
      # Desenvolvimento: usa priv/static/uploads
      Path.join([
        :code.priv_dir(:perdi_meu_pet) |> to_string(),
        "static",
        "uploads"
      ])
    end
  end

  @doc """
  Retorna o número de dias que um post será mantido antes da exclusão automática.
  """
  def days_to_keep, do: @days_to_keep
end

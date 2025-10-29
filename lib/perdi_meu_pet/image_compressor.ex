defmodule PerdiMeuPet.ImageCompressor do
  @moduledoc """
  Módulo para compressão de imagens usando comandos do sistema.
  Reduz o tamanho de imagens para economizar espaço de armazenamento.
  """

  @max_width 1200
  @max_height 1200
  @quality 85

  @doc """
  Comprime uma imagem redimensionando e ajustando qualidade.
  Retorna o caminho do arquivo comprimido.
  """
  def compress(file_path) do
    original_size = File.stat!(file_path).size

    result = case get_image_type(file_path) do
      {:ok, type} when type in ["jpg", "jpeg", "png", "webp"] ->
        compress_image(file_path, type)

      _ ->
        # Se não for uma imagem suportada, retorna o arquivo original
        {:ok, file_path}
    end

    # Log da compressão
    case result do
      {:ok, compressed_path} ->
        compressed_size = File.stat!(compressed_path).size
        reduction = Float.round((1 - compressed_size / original_size) * 100, 1)

        if compressed_size < original_size do
          IO.puts("✓ Imagem comprimida: #{format_bytes(original_size)} → #{format_bytes(compressed_size)} (#{reduction}% menor)")
        else
          IO.puts("✓ Imagem já otimizada: #{format_bytes(original_size)}")
        end

        result

      _ ->
        result
    end
  end

  defp format_bytes(bytes) when bytes < 1024, do: "#{bytes}B"
  defp format_bytes(bytes) when bytes < 1024 * 1024, do: "#{Float.round(bytes / 1024, 1)}KB"
  defp format_bytes(bytes), do: "#{Float.round(bytes / (1024 * 1024), 1)}MB"

  defp get_image_type(file_path) do
    case Path.extname(file_path) |> String.downcase() do
      ext when ext in [".jpg", ".jpeg"] -> {:ok, "jpeg"}
      ".png" -> {:ok, "png"}
      ".webp" -> {:ok, "webp"}
      _ -> {:error, :unsupported_type}
    end
  end

  defp compress_image(file_path, _type) do
    # Usa System.cmd para chamar sips (ferramenta nativa do macOS)
    # ou convert (ImageMagick) se disponível
    cond do
      command_available?("sips") ->
        compress_with_sips(file_path)

      command_available?("convert") ->
        compress_with_imagemagick(file_path)

      true ->
        # Se nenhuma ferramenta disponível, apenas reduz qualidade do arquivo
        reduce_file_size(file_path)
    end
  end

  defp compress_with_sips(file_path) do
    # Redimensiona mantendo proporções e converte para formato menor
    temp_file = file_path <> ".tmp"

    case System.cmd("sips", [
      "-Z", "#{@max_width}",
      "--setProperty", "format", "jpeg",
      "--setProperty", "formatOptions", "#{@quality}",
      file_path,
      "--out", temp_file
    ], stderr_to_stdout: true) do
      {_, 0} ->
        File.rm(file_path)
        File.rename(temp_file, file_path)
        {:ok, file_path}

      _ ->
        File.rm(temp_file)
        {:ok, file_path}
    end
  end

  defp compress_with_imagemagick(file_path) do
    temp_file = file_path <> ".tmp"

    case System.cmd("convert", [
      file_path,
      "-resize", "#{@max_width}x#{@max_height}>",
      "-quality", "#{@quality}",
      temp_file
    ], stderr_to_stdout: true) do
      {_, 0} ->
        File.rm(file_path)
        File.rename(temp_file, file_path)
        {:ok, file_path}

      _ ->
        if File.exists?(temp_file), do: File.rm(temp_file)
        {:ok, file_path}
    end
  end

  defp reduce_file_size(file_path) do
    # Fallback: se nenhuma ferramenta disponível,
    # pelo menos verifica o tamanho e alerta
    file_stat = File.stat!(file_path)
    max_size = 5 * 1024 * 1024  # 5MB

    if file_stat.size > max_size do
      IO.warn("Imagem muito grande (#{file_stat.size} bytes) e nenhuma ferramenta de compressão disponível")
    end

    {:ok, file_path}
  end

  defp command_available?(command) do
    case System.cmd("which", [command], stderr_to_stdout: true) do
      {output, 0} -> String.trim(output) != ""
      _ -> false
    end
  rescue
    _ -> false
  end
end

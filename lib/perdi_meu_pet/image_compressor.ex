defmodule PerdiMeuPet.ImageCompressor do
  @moduledoc """
  Module for image compression using system commands.
  Reduces image size to save storage space.
  """

  @max_width 1200
  @max_height 1200
  @quality 65

  @doc """
  Compresses an image by resizing and adjusting quality.
  Returns the path of the compressed file.
  """
  def compress(file_path) do
    original_size = File.stat!(file_path).size

    result = case get_image_type(file_path) do
      {:ok, type} when type in ["jpg", "jpeg", "png", "webp"] ->
        compress_image(file_path, type)

      _ ->
        # If not a supported image, return the original file
        {:ok, file_path}
    end

    # Log compression results
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
    # Uses System.cmd to call sips (macOS native tool)
    # or convert (ImageMagick) if available
    cond do
      command_available?("sips") ->
        compress_with_sips(file_path)

      command_available?("convert") ->
        compress_with_imagemagick(file_path)

      true ->
        # If no tools available, just reduce file size
        reduce_file_size(file_path)
    end
  end

  defp compress_with_sips(file_path) do
    # Resize maintaining proportions and convert to smaller format
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
    # Fallback: if no tools available,
    # at least check size and warn
    file_stat = File.stat!(file_path)
    max_size = 5 * 1024 * 1024  # 5MB

    if file_stat.size > max_size do
      IO.warn("Image too large (#{file_stat.size} bytes) and no compression tools available")
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

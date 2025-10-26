defmodule PerdiMeuPetWeb.CommentsController do
  use PerdiMeuPetWeb, :controller
  alias PerdiMeuPet.Comments

  def index(conn, %{"pet_id" => pet_id}) do
    pet_id = parse_id(pet_id)
    comments = Comments.list_comments_for_pet(pet_id)
    json(conn, comments)
  end

  def create(conn, %{"pet_id" => pet_id, "comment" => comment_params}) do
    pet_id = parse_id(pet_id)
    params = Map.put(comment_params, "pet_id", pet_id)

    case Comments.create_comment(params) do
      {:ok, comment} -> json(conn, comment)
      {:error, changeset} ->
        conn
        |> put_status(400)
        |> json(%{errors: translate_errors(changeset)})
    end
  end

  defp parse_id(id) when is_binary(id) do
    case Integer.parse(id) do
      {i, _} -> i
      :error -> id
    end
  end

  defp parse_id(id), do: id

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {k, v}, acc -> String.replace(acc, "%{#{k}}", to_string(v)) end)
    end)
  end
end

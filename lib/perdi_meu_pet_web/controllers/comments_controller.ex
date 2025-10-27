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

  def update(conn, %{"id" => id, "comment" => comment_params}) do
    comment = Comments.get_comment(parse_id(id))
    current_user = conn.assigns[:current_user]

    cond do
      is_nil(comment) ->
        conn |> put_status(404) |> json(%{error: "Comentário não encontrado"})

      comment.user_id != current_user.id ->
        conn |> put_status(403) |> json(%{error: "Você não pode editar este comentário"})

      true ->
        case Comments.update_comment(comment, comment_params) do
          {:ok, updated_comment} -> json(conn, updated_comment)
          {:error, changeset} ->
            conn
            |> put_status(400)
            |> json(%{errors: translate_errors(changeset)})
        end
    end
  end

  def delete(conn, %{"id" => id}) do
    comment = Comments.get_comment(parse_id(id))
    current_user = conn.assigns[:current_user]

    cond do
      is_nil(comment) ->
        conn |> put_status(404) |> json(%{error: "Comentário não encontrado"})

      comment.user_id != current_user.id ->
        conn |> put_status(403) |> json(%{error: "Você não pode excluir este comentário"})

      true ->
        case Comments.delete_comment(comment) do
          {:ok, _} -> json(conn, %{success: true})
          {:error, _} ->
            conn
            |> put_status(500)
            |> json(%{error: "Erro ao excluir comentário"})
        end
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

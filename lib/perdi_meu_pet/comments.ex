import Ecto.Query, warn: false
defmodule PerdiMeuPet.Comments do
  alias PerdiMeuPet.Repo
  alias PerdiMeuPet.Comments.Comment

  def create_comment(attrs) do
    %Comment{}
    |> Comment.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, comment} -> {:ok, Repo.preload(comment, :user)}
      error -> error
    end
  end

  def list_comments_for_pet(pet_id) do
    Repo.all(
      from c in Comment,
      where: c.pet_id == ^pet_id,
      order_by: [asc: c.inserted_at],
      preload: [:user]
    )
  end

  def get_comment(id) do
    Repo.get(Comment, id)
    |> Repo.preload(:user)
  end

  def update_comment(comment, attrs) do
    comment
    |> Comment.changeset(attrs)
    |> Repo.update()
    |> case do
      {:ok, comment} -> {:ok, Repo.preload(comment, :user)}
      error -> error
    end
  end

  def delete_comment(comment) do
    Repo.delete(comment)
  end
end

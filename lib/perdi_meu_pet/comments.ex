import Ecto.Query, warn: false
defmodule PerdiMeuPet.Comments do
  alias PerdiMeuPet.Repo
  alias PerdiMeuPet.Comments.Comment

  def create_comment(attrs) do
    %Comment{}
    |> Comment.changeset(attrs)
    |> Repo.insert()
  end

  def list_comments_for_pet(pet_id) do
    Repo.all(from c in Comment, where: c.pet_id == ^pet_id, order_by: [asc: c.inserted_at])
  end
end

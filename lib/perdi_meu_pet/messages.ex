defmodule PerdiMeuPet.Messages do
  alias PerdiMeuPet.Repo
  alias PerdiMeuPet.Messages.Message
  import Ecto.Query, warn: false

  def create_message(attrs) do
    %Message{}
    |> Message.changeset(attrs)
    |> Repo.insert()
  end

  def list_messages_for_user(user_id) do
    Repo.all(from m in Message, where: m.to_user_id == ^user_id or m.from_user_id == ^user_id, order_by: [desc: m.inserted_at])
  end

  def conversation_between(user1, user2) do
    Repo.all(from m in Message, where: (m.from_user_id == ^user1 and m.to_user_id == ^user2) or (m.from_user_id == ^user2 and m.to_user_id == ^user1), order_by: [asc: m.inserted_at])
  end
end

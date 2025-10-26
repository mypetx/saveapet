defmodule PerdiMeuPetWeb.MessagesController do
  use Phoenix.Controller
  alias PerdiMeuPet.Messages

  action_fallback PerdiMeuPetWeb.FallbackController

  def create(conn, %{"to_user_id" => to_user_id, "message" => message} = params) do
    from_user = conn.assigns[:current_user]
    pet_id = Map.get(params, "pet_id")

    if from_user == nil do
      conn |> put_status(401) |> json(%{error: "unauthenticated"})
    else
      case Messages.create_message(%{"from_user_id" => from_user.id, "to_user_id" => to_user_id, "pet_id" => pet_id, "message" => message}) do
        {:ok, msg} -> json(conn, %{message: msg})
        {:error, changeset} -> conn |> put_status(400) |> json(%{error: "invalid data", details: Ecto.Changeset.traverse_errors(changeset, fn {msg, _} -> msg end)})
      end
    end
  end

  def index(conn, _params) do
    user = conn.assigns[:current_user]
    if user == nil do
      conn |> put_status(401) |> json(%{error: "unauthenticated"})
    else
      msgs = Messages.list_messages_for_user(user.id)
      json(conn, %{messages: msgs})
    end
  end

  def conversation(conn, %{"user_id" => other_id}) do
    user = conn.assigns[:current_user]
    if user == nil do
      conn |> put_status(401) |> json(%{error: "unauthenticated"})
    else
      msgs = Messages.conversation_between(user.id, String.to_integer(other_id))
      json(conn, %{messages: msgs})
    end
  end
end

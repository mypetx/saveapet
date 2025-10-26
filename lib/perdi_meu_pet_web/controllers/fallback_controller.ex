defmodule PerdiMeuPetWeb.FallbackController do
  use Phoenix.Controller

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> json(%{error: "not found"})
  end

  def call(conn, {:error, reason}) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: inspect(reason)})
  end
end

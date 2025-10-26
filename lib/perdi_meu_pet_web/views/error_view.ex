defmodule PerdiMeuPetWeb.ErrorView do
  def render("404.json", _assigns), do: %{error: "not found"}
  def render("500.json", _assigns), do: %{error: "internal_server_error"}

  def template_not_found(_template, _assigns), do: %{error: "unknown_error"}
end

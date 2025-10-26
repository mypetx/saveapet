defmodule PerdiMeuPetWeb.Router do
  use Phoenix.Router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :auth do
    plug PerdiMeuPetWeb.Plugs.Auth
  end

  scope "/api", PerdiMeuPetWeb do
    pipe_through :api

    post "/register", AuthController, :register
    post "/login", AuthController, :login

    pipe_through :auth
    get "/me", AuthController, :me
  patch "/me", AuthController, :update
    resources "/pets", PetsController, only: [:index, :show, :create]
    post "/messages", MessagesController, :create
    get "/messages", MessagesController, :index
    get "/messages/conversation/:user_id", MessagesController, :conversation
  # comments on pets
  get "/pets/:pet_id/comments", CommentsController, :index
  post "/pets/:pet_id/comments", CommentsController, :create
  end

  # Serve project images (logo) directly from repo root
  get "/imgs/logo.png", PerdiMeuPetWeb.ImagesController, :logo

  # fallback to serve SPA index.html
  get "/*path", PerdiMeuPetWeb.SpaController, :index
end

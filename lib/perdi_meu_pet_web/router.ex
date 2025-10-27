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

    # Public routes - no auth required
    get "/pets", PetsController, :index
    get "/pets/:id", PetsController, :show
    get "/pets/:pet_id/comments", CommentsController, :index

    pipe_through :auth
    get "/me", AuthController, :me
    patch "/me", AuthController, :update
    post "/pets", PetsController, :create
    patch "/pets/:id", PetsController, :update
    delete "/pets/:id", PetsController, :delete
    post "/messages", MessagesController, :create
    get "/messages", MessagesController, :index
    get "/messages/conversation/:user_id", MessagesController, :conversation
    # comments on pets - auth required
    post "/pets/:pet_id/comments", CommentsController, :create
    patch "/comments/:id", CommentsController, :update
    delete "/comments/:id", CommentsController, :delete
  end

  # Serve project images directly from priv/static/imgs
  get "/imgs/:filename", PerdiMeuPetWeb.ImagesController, :serve

  # fallback to serve SPA index.html
  get "/*path", PerdiMeuPetWeb.SpaController, :index
end

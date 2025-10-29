defmodule PerdiMeuPet.Scheduler do
  @moduledoc """
  Scheduler for periodic tasks like cleaning old posts.
  """

  use GenServer
  require Logger
  alias PerdiMeuPet.Pets.Cleaner

  # Run cleanup every 24 hours (in milliseconds)
  @cleanup_interval 24 * 60 * 60 * 1000

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @impl true
  def init(state) do
    Logger.info("Scheduler started - Automatic cleanup enabled (every 24h)")

    # Schedule first cleanup for 1 minute after start (for testing)
    # In production, can increase to several hours
    schedule_cleanup(60_000)

    {:ok, state}
  end

  @impl true
  def handle_info(:cleanup, state) do
    Logger.info("Running automatic cleanup of old posts...")

    try do
      Cleaner.clean_old_posts()
    rescue
      e ->
        Logger.error("Error in automatic cleanup: #{inspect(e)}")
    end

    # Schedule next cleanup
    schedule_cleanup(@cleanup_interval)

    {:noreply, state}
  end

  defp schedule_cleanup(interval) do
    Process.send_after(self(), :cleanup, interval)
  end

  @doc """
  Forces immediate cleanup execution (useful for testing).
  """
  def run_cleanup_now do
    send(__MODULE__, :cleanup)
  end
end

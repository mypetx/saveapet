defmodule PerdiMeuPet.Scheduler do
  @moduledoc """
  Scheduler para tarefas periódicas como limpeza de posts antigos.
  """

  use GenServer
  require Logger
  alias PerdiMeuPet.Pets.Cleaner

  # Executa limpeza a cada 24 horas (em milissegundos)
  @cleanup_interval 24 * 60 * 60 * 1000

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @impl true
  def init(state) do
    Logger.info("Scheduler iniciado - Limpeza automática ativada (a cada 24h)")

    # Agenda a primeira limpeza para 1 minuto após o start (para testes)
    # Em produção, pode aumentar para algumas horas
    schedule_cleanup(60_000)

    {:ok, state}
  end

  @impl true
  def handle_info(:cleanup, state) do
    Logger.info("Executando limpeza automática de posts antigos...")

    try do
      Cleaner.clean_old_posts()
    rescue
      e ->
        Logger.error("Erro na limpeza automática: #{inspect(e)}")
    end

    # Agenda próxima limpeza
    schedule_cleanup(@cleanup_interval)

    {:noreply, state}
  end

  defp schedule_cleanup(interval) do
    Process.send_after(self(), :cleanup, interval)
  end

  @doc """
  Força execução imediata da limpeza (útil para testes).
  """
  def run_cleanup_now do
    send(__MODULE__, :cleanup)
  end
end

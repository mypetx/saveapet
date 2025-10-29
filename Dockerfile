FROM hexpm/elixir:1.16.2-erlang-26.2.2-debian-bookworm-20240130-slim AS build

# Install build dependencies
RUN apt-get update -y && apt-get install -y build-essential git curl \
    && apt-get clean && rm -f /var/lib/apt/lists/*_*

# Prepare build dir
WORKDIR /app

# Install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Set build ENV
ENV MIX_ENV="prod"

# Install mix dependencies
COPY mix.exs mix.lock ./
RUN mix deps.get --only $MIX_ENV
RUN mkdir config

# Copy compile-time config files
COPY config/config.exs config/
COPY config/runtime.exs config/
RUN mix deps.compile

# Copy application code
COPY lib lib
COPY priv priv

# Compile the release
RUN mix compile

# Build release
RUN mix release

# Start a new build stage
FROM debian:bookworm-slim AS app

RUN apt-get update -y && \
  apt-get install -y libstdc++6 openssl libncurses5 locales ca-certificates imagemagick \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*

# Set the locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR "/app"
RUN chown nobody /app

# Set runner ENV
ENV MIX_ENV="prod"

# Copy built release
COPY --from=build --chown=nobody:root /app/_build/${MIX_ENV}/rel/perdi_meu_pet ./

USER nobody

# Start the phoenix application
CMD ["/app/bin/perdi_meu_pet", "start"]

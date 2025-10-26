defmodule PerdiMeuPetWeb.Token do
  @moduledoc false
  @secret Application.compile_env(:perdi_meu_pet, :jwt_secret, "dev-jwt-secret")

  # Use JOSE directly to avoid signer configuration issues with Joken on some setups.
  def generate(claims) when is_map(claims) do
    jwk = JOSE.JWK.from_oct(@secret)
    try do
      {_, jws} = JOSE.JWT.sign(jwk, %{"alg" => "HS256"}, claims) |> JOSE.JWS.compact()
      {:ok, jws}
    rescue
      err -> {:error, err}
    end
  end

  def verify(token) when is_binary(token) do
    jwk = JOSE.JWK.from_oct(@secret)
    case JOSE.JWT.verify_strict(jwk, ["HS256"], token) do
      {true, jwt, _jws} -> {:ok, jwt.fields}
      _ -> :error
    end
  rescue
    _ -> :error
  end
end

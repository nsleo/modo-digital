#!/bin/sh
set -eu

env_file="${MODO_TEST_ENV_FILE:-.env.test.local}"
if [ -f "$env_file" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$env_file"
  set +a
fi

: "${MODO_API_BASE_URL:?Defina MODO_API_BASE_URL, por exemplo https://sejamododigital.com.br}"
: "${MODO_ADMIN_KEY:?Defina MODO_ADMIN_KEY com a chave interna da API}"
: "${MODO_TEST_LEAD_ID:?Defina MODO_TEST_LEAD_ID com o public_id de um lead descartavel}"

endpoint="${MODO_API_BASE_URL%/}/api/v1/internal/lead-details.php?leadId=${MODO_TEST_LEAD_ID}"
curl_config=$(mktemp)
response_file=$(mktemp)
trap 'rm -f "$curl_config" "$response_file"' EXIT HUP INT TERM

chmod 600 "$curl_config"
printf 'header = "X-MODO-ADMIN-KEY: %s"\n' \
  "$MODO_ADMIN_KEY" \
  > "$curl_config"

status=$(
  curl \
    --config "$curl_config" \
    --silent \
    --show-error \
    --output "$response_file" \
    --write-out '%{http_code}' \
    "$endpoint"
)

if [ "$status" != '200' ]; then
  echo "Falha: a consulta do lead retornou HTTP $status."
  cat "$response_file"
  echo
  exit 1
fi

if ! grep -q "\"publicId\":\"$MODO_TEST_LEAD_ID\"" "$response_file"; then
  echo "Falha: a resposta nao confirmou o lead consultado."
  cat "$response_file"
  echo
  exit 1
fi

echo "Lead consultado (HTTP 200):"
cat "$response_file"
echo

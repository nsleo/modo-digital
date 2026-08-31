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

project_type="${MODO_TEST_PROJECT_TYPE:-other}"
endpoint="${MODO_API_BASE_URL%/}/api/v1/internal/convert-lead.php"
payload=$(printf '{"leadId":"%s","projectType":"%s","createBriefing":true}' \
  "$MODO_TEST_LEAD_ID" \
  "$project_type")
curl_config=$(mktemp)
first_response=$(mktemp)
second_response=$(mktemp)
trap 'rm -f "$curl_config" "$first_response" "$second_response"' EXIT HUP INT TERM

chmod 600 "$curl_config"
printf 'header = "Content-Type: application/json"\nheader = "X-MODO-ADMIN-KEY: %s"\n' \
  "$MODO_ADMIN_KEY" \
  > "$curl_config"

request() {
  response_file="$1"

  curl \
    --config "$curl_config" \
    --silent \
    --show-error \
    --output "$response_file" \
    --write-out '%{http_code}' \
    --request POST \
    --data "$payload" \
    "$endpoint"
}

first_status=$(request "$first_response")
if [ "$first_status" != '201' ]; then
  echo "Falha: a primeira conversao retornou HTTP $first_status."
  cat "$first_response"
  echo
  exit 1
fi

echo "Conversao criada (HTTP 201):"
cat "$first_response"
echo

second_status=$(request "$second_response")
if [ "$second_status" != '409' ]; then
  echo "Falha: a repeticao deveria retornar HTTP 409, mas retornou $second_status."
  cat "$second_response"
  echo
  exit 1
fi

echo "Protecao contra duplicidade confirmada (HTTP 409 na repeticao):"
cat "$second_response"
echo

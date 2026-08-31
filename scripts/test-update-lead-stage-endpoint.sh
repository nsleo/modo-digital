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

pipeline_stage="${MODO_TEST_PIPELINE_STAGE:-qualified}"
qualification_notes="${MODO_TEST_QUALIFICATION_NOTES:-Lead qualificado em smoke test operacional.}"
endpoint="${MODO_API_BASE_URL%/}/api/v1/internal/update-lead-stage.php"
payload=$(printf '{"leadId":"%s","pipelineStage":"%s","qualificationNotes":"%s","markContacted":true}' \
  "$MODO_TEST_LEAD_ID" \
  "$pipeline_stage" \
  "$qualification_notes")
curl_config=$(mktemp)
response_file=$(mktemp)
trap 'rm -f "$curl_config" "$response_file"' EXIT HUP INT TERM

chmod 600 "$curl_config"
printf 'header = "Content-Type: application/json"\nheader = "X-MODO-ADMIN-KEY: %s"\n' \
  "$MODO_ADMIN_KEY" \
  > "$curl_config"

status=$(
  curl \
    --config "$curl_config" \
    --silent \
    --show-error \
    --output "$response_file" \
    --write-out '%{http_code}' \
    --request POST \
    --data "$payload" \
    "$endpoint"
)

if [ "$status" != '200' ]; then
  echo "Falha: a atualizacao do lead retornou HTTP $status."
  cat "$response_file"
  echo
  exit 1
fi

if ! grep -q "\"pipelineStage\":\"$pipeline_stage\"" "$response_file"; then
  echo "Falha: a resposta nao confirmou pipelineStage=$pipeline_stage."
  cat "$response_file"
  echo
  exit 1
fi

echo "Lead atualizado (HTTP 200):"
cat "$response_file"
echo

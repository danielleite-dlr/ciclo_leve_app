#!/usr/bin/env bash
#
# Atualiza a landing page (site/) em producao.
#
# O Nginx serve a LP de /var/www/appcicloleve (e NAO direto do repo, porque o
# repo fica em /root, que tem permissao 700 e o Nginx/www-data nao consegue ler).
# Por isso, depois de um git pull, e preciso copiar os arquivos para la.
# Este script faz os dois passos (pull + copia) de uma vez.
#
# Uso na VPS:  bash /root/ciclo_leve_app/deploy/atualizar-site.sh
#
set -euo pipefail

REPO="/root/ciclo_leve_app"
DESTINO="/var/www/appcicloleve"

echo "==> Atualizando o repositorio ($REPO)"
git -C "$REPO" pull --ff-only

echo "==> Publicando site/ em $DESTINO"
mkdir -p "$DESTINO"
# --delete remove no destino o que foi apagado no repo; mantem os dois iguais.
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$REPO/site/" "$DESTINO/"
else
  rm -rf "${DESTINO:?}/"*
  cp -r "$REPO/site/." "$DESTINO/"
fi
chmod -R a+rX "$DESTINO"

echo "==> Validando a configuracao do Nginx"
nginx -t

echo "==> Recarregando o Nginx"
systemctl reload nginx

echo "==> Pronto. LP atualizada em https://appcicloleve.atimoscrm.com.br"

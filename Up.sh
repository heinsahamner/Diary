#!/bin/bash
set -euo pipefail

# 1. build
npm run build

# 2. apaga tudo que já existe no destino
sudo rm -rf /var/www/html/diary/*

# 3. copia o conteúdo da dist
sudo rsync -av --delete /var/www/diary/dist/ /var/www/html/diary/

# 4. ajusta permissão para o Apache
sudo chown -R www-data:www-data /var/www/html/diary

npm run build && sudo rm -rf /var/www/html/diary/* && sudo rsync -av --delete /var/www/diary/dist/ /var/www/html/diary/ && sudo chown -R www-data:www-data /var/www/html/diary
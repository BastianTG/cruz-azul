#!/bin/bash
set -e

REPO_URL="${1:-}"
DB_HOST="${2:-18.235.20.153}"
DB_PASSWORD="${3:-tu_password}"

if [ -z "$REPO_URL" ]; then
  echo "Uso: $0 <repo-url> [db-host] [db-password]"
  echo "Ej: $0 https://github.com/usuario/cruz-azul.git 18.235.20.153 miClaveSegura"
  exit 1
fi

echo "=== Instalando Docker ==="
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

echo "=== Instalando Docker Compose ==="
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "=== Clonando repo ==="
cd /home/ec2-user
git clone "$REPO_URL" cruz-azul
cd cruz-azul

echo "=== Configurando conexión a BD ==="
sed -i "s/DB_HOST=18.235.20.153/DB_HOST=$DB_HOST/g" docker-compose.frontend.yml
sed -i "s/DB_PASSWORD=tu_password/DB_PASSWORD=$DB_PASSWORD/g" docker-compose.frontend.yml

echo "=== Iniciando frontend ==="
sudo docker-compose -f docker-compose.frontend.yml up -d

echo "=== Listo ==="
echo "Frontend corriendo en http://$(curl -s http://checkip.amazonaws.com)"
echo ""
echo "IMPORTANTE: Abre el puerto 80 en el Security Group"

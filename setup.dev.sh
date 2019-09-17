env="local"
echo "====================== start setup.${env}.sh ======================"
# if [ "${TRAVIS_PULL_REQUEST}" = false ]; then
#   echo "======================   master push   ======================"
# fi
# if [ "${TRAVIS_PULL_REQUEST}" != false ]; then
#   echo "======================   push request   ======================"
# fi

docker-compose build --force-rm --compress

docker-compose up -d
# 删除 none 镜像
docker ps -a | grep "Exited" | awk '{print $1 }'|xargs docker stop

docker ps -a | grep "Exited" | awk '{print $1 }'|xargs docker rm

docker images|grep none|awk '{print $3 }'|xargs docker rmi


echo "====================== end setup.${env}.sh ======================" 


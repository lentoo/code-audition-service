env=$1
echo ${env}
dockerComposeFile=""
if [ "${env}" == 'dev' ]
  then
    dockerComposeFile="docker-compose.yml"
  else 
    git pull origin develop
    dockerComposeFile="docker-compose.test.yml"
fi
# master 分支目前不做任何事情
if [ "${TRAVIS_BRANCH}" == 'master' ]
  then 
    exit
fi

echo "====================== start setup.${env}.sh ======================"

echo "====================== use ${dockerComposeFile} ======================"

docker-compose -f ${dockerComposeFile} build --force-rm --compress

docker-compose -f ${dockerComposeFile} up -d
# 删除 none 镜像
docker ps -a | grep "Exited" | awk '{print $1 }'|xargs docker stop

docker ps -a | grep "Exited" | awk '{print $1 }'|xargs docker rm

docker images|grep none|awk '{print $3 }'|xargs docker rmi


echo "====================== end setup.${env}.sh ======================" 


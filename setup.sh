echo "======================   start setup.sh======================"
env = "local"
# if [ "${TRAVIS_PULL_REQUEST}" = false ]; then
#   echo "======================   master push   ======================"
# fi
# if [ "${TRAVIS_PULL_REQUEST}" != false ]; then
#   echo "======================   push request   ======================"
# fi

git status

git pull origin master

docker-compose -f docker-compose.test.yml build --force-rm --compress
docker-compose -f docker-compose.test.yml up -d

echo "======================   end setup.sh   ======================" 
# docker-compose stop
# docker-compose rm -f
# docker rmi egg-code-audition_egg-code-audition
# docker-compose up -d


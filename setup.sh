echo "======================   start setup.sh ${TRAVIS_BRANCH}  ======================"

if [ "${TRAVIS_PULL_REQUEST}" = false ]; then
  echo "======================   master push   ======================"
fi
if [ "${TRAVIS_PULL_REQUEST}" != false ]; then
  echo "======================   push request   ======================"
fi

echo "======================   end setup.sh   ======================"


# docker-compose stop
# docker-compose rm -f
# docker rmi egg-code-audition_egg-code-audition
# docker-compose up -d


IMAGE_NAME="pystl_p1-server"

alias start-dev="docker run -d -it --rm --name dev_container -v $(pwd):/app -w /app $IMAGE_NAME tail -f /dev/null"
alias lserv="docker compose logs --tail=500 server"
alias rserv="docker compose restart server"
alias tserv="docker compose exec server python3 manage.py test"
alias sserv="docker compose exec server bash"

alias lmock="docker compose logs --tail=500 mock-worker"
alias rmock="docker compose restart mock-worker"

alias rweb="docker compose restart web"
alias lweb="docker compose logs web"

alias laec="docker compose logs aecif-worker"
alias raec="docker compose restart aecif-worker"
alias saec="docker compose exec aecif-worker bash"

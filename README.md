# Cluster Server

Load balanced server using Docker.


## Node Server

### Build Docker Image

```shell script
docker build -t node-server node-server
```

### Run Docker Container

```shell script
docker run -it -e WORKER_NUM=3 -e SERVER_PORT=8080 -p 3001:8080 --name node-cluster-1 node-server

docker run -it -e WORKER_NUM=3 -e SERVER_PORT=8080 -p 3002:8080 --name node-cluster-2 node-server
```

* `GET /` Show master ID and worker ID.
* `GET /kill` Kill worker.


## NGINX Server

### Run Docker Container

```shell script
docker run -it -v /root/cluster-server/nginx-server/default.conf:/etc/nginx/conf.d/default.conf --net="host" --name nginx-server nginx:stable
```

In actual services, add `least_conn`, `ip_hash`,  `server_name` to config.

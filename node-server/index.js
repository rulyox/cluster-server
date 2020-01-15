const cluster = require('cluster');
const uuid = require('uuid');

const instanceId = uuid.v4();
const workerNum = process.env.WORKER_NUM;
const serverPort = process.env.SERVER_PORT;

if(cluster.isMaster) {

    console.log(`Server ID : ${instanceId}`);
    console.log(`Number of CPU : ${workerNum}`);

    let workerListener = (msg) => {

        let workerId = msg.workerId;

        if(msg.cmd === 'GET_MASTER_ID') {

            cluster.workers[workerId].send({
                cmd : 'SEND_MASTER_ID',
                masterId : instanceId
            });

        }

    };

    let createWorker = () => {

        let newWorker = cluster.fork();
        newWorker.on('message', workerListener);

    };

    // create workers
    for(let i = 0; i < workerNum; i++) {

        console.log(`Worker created [${i+1}/${workerNum}]`);

        createWorker();

    }

    // listener worker online
    cluster.on('online', (worker) => {

        console.log(`Worker online : ${worker.process.pid}`);

    });

    // listener worker dead
    cluster.on('exit', (worker) => {

        console.log(`Worker dead : ${worker.process.pid}`);
        console.log('Creating new worker.');

        createWorker();

    });

} else if(cluster.isWorker) {

    let express = require('express');
    let app = express();

    let workerId = cluster.worker.id;
    let masterId;
    process.send({
        workerId : workerId,
        cmd : 'GET_MASTER_ID'
    });
    process.on('message', (msg) => {

        if(msg.cmd === 'SEND_MASTER_ID') masterId = msg.masterId;

    });

    app.get('/', (resquest, response) => {

        response.send(`Master : ${masterId}<br>Worker : ${workerId}`);

    });

    app.get('/kill', (request, response) => {

        cluster.worker.kill();

        response.send('Worker killed.');

    });

    app.listen(serverPort);

}

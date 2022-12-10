'use strict';
const path = require('path');
const express = require('express');
const exppresSocket = require('express-ws');
const mysql = require('mysql2');

const mysqlConn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hks5fwK3vEFKVhyJaK9Y5mMf',
    database: 'sportschedule',
});

mysqlConn.connect(function (err) {
    if (err)
        throw err;
    console.log('connected to mysql');
});

const app = express();
exppresSocket(app);

const staticPath = path.join(__dirname, '/');
app.use(express.static(staticPath));

app.set('port', process.env.PORT || 3000);

let connections = new Set();

const wsHandler = (ws) => {
    connections.add(ws);

    ws.on('message', (data) => {
        const parsedData = JSON.parse(data);
        if ('chosenWeekDay' in parsedData) {
            if (!parsedData.chosenWeekDay) {
                ws.send(JSON.stringify({ 'data': [], 'chosenWeekDay': [] }));
                return;
            }
            const query = `SELECT ss.id, ss.name, ss.weekday FROM sportschedule_schedule as ss WHERE ss.is_active = 1 AND ss.sequence = 1 AND ss.weekday IN (?) 
                            ORDER BY FIELD(UPPER(ss.weekday), 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')`;
            mysqlConn.query(query, [parsedData.chosenWeekDay], function (err, result, fields) {
                if (err)
                    throw err;
                ws.send(JSON.stringify({ 'data': result, 'chosenWeekDay': parsedData.chosenWeekDay }));
            });
        }
    });

    ws.on('close', () => {
        connections.delete(ws);
    });
}

app.ws('/', wsHandler);

const server = app.listen(app.get('port'), function () {
    console.log(`Listening on PORT: ${app.get('port')}.`);
});

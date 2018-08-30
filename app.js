let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let server = require('http').createServer(app);
let io = require('socket.io').listen(server).sockets;
let exphbs = require('express-handlebars');

// handlebars middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//static folder 
app.use(express.static(`${__dirname}/public`));

// parser data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.render('index');
});
let listUserName = [];

io.on('connection', socket => {
    console.log('user join');
    updataUserName();
    let username = '';
    socket.on('loginName', (name, callback) => {
        if (name.trim().length === 0) {
            return;
        }
        callback(true);
        username = name;
        listUserName.push(username);
        updataUserName();
    });
    socket.on('messageText', data => {
        console.log(data);
        socket.emit('output', {
            name: username,
            msg: data
        });
    });
    // disconnect
    socket.on('disconnect', () => {
        console.log('user quik');
        listUserName.splice(listUserName.indexOf(username), 1);
        updataUserName();
    });
    // updataUserName
    function updataUserName() {
        io.emit('userLoad', listUserName);
    }
});


let port = process.env.PORT || 1000;
server.listen(port, () => {
    console.log(`server start ${port}`);
});
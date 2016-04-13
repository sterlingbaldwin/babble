var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var fs            = require('fs');
var passport      = require('passport');
var connect       = require('connect');
var flash         = require('connect-flash');
var configDB      = require('./config/database.js');
var socket        = require('./config/socket.js');
var async         = require('async');

//models
var Group         = require('./app/models/group.js');
var Discussion    = require('./app/models/discussion.js');
var Comment       = require('./app/models/comment.js');

var app = express();

//socket io setup
try {
  var server   = require('http').Server(app);
  var io       = require('socket.io')(8080);
  var websockets = {};
  var socket_count = 0;

  io.on('connection', function(client){

    client.on('init', function(data){
      console.log('got an init from client:', client.id, ' with profile:', data.profile);
      //console.log(data);
      //client.send('message to client');
      client.profile = data.profile;
      websockets[client.id] = client;
      client.emit('clientId', client.id);

    });

    client.on('disconnect', function(data){
      for(i in websockets){
        console.log(websockets[i].id, ' ', websockets[i].profile);
        if(websockets[i].id == client.id){
          console.log('removing ', client.id, ' from the websockets list');
          delete websockets[i];
        }
      }
    });


    client.on('select_profile', function(data){

    });

    client.on('chat:new', function(data){
      console.log(client.profile, 'sent new chat message', data);
      Discussion
        .findOne({
          _id: data.discussion._id
        })
        .exec(function(err, doc){
          if(err || !doc){
            console.log("error finding discussion");
            console.log(err);
            return;
          }
          Comment
            .findOne({
              _id: doc.comment
            })
            .exec(function(err, comm){
              if(err || !comm){
                console.log("error finding comment");
                console.log(err);
                return;
              }
              newComm = new Comment({
                content: data.text,
                parent_profile: client.profile,
                parent_comment: comm._id,
              });
              newComm.save();
              comm.comment_list.push(newComm._id);
              comm.save();

              console.log('data.discussion._id',data.discussion._id);
            //  console.log('websockets',websockets);
              var profiles = [];
              for(i in websockets){
                console.log('i', i);
                //console.log('websockets[i]', websockets[i]);
                //console.log('websockets[i].client.discussion._id', websockets[i].discussion._id);
                if(websockets[i].discussion && (websockets[i].discussion._id == data.discussion._id)){
                  console.log(websockets[i].profile, 'is in discussion', websockets[i].discussion.id, "and is getting message", newComm);
                  newComm.translateMarkdown();
                  websockets[i].emit('message:new', newComm);
                }
              }
            });
        });
    })

    client.on('discussion:get_messages', function(data){
      console.log(client.profile, 'is asking for messages from discussion', data.discussion);
      client.discussion = data.discussion;
      Discussion
        .findOne({
          _id: data.discussion._id
        })
        .exec(function(err, disc){
          if(err || !disc){
            console.log("error finding discussion");
            console.log(err);
            return;
          }
          console.log('found discussion');
          console.log(disc);
          console.log('looking for comment', disc.comment);
          Comment
            .findOne({
              _id: disc.comment
            })
            .exec(function(err, comment){
              if(err || !disc){
                console.log("error finding comment");
                console.log(err);
                return;
              }
              //find all children comments title, discription, content
              var calls = [];
              var comments = [];
              console.log('looking for comments', comment.comment_list);
              comment.comment_list.forEach(function(item){
                calls.push(function(cb){
                  Comment
                    .findOne({
                      _id: item
                    })
                    .exec(function(err, doc){
                      if(err || !doc){
                        console.log("error finding comment");
                        console.log(err);
                        return;
                      }
                      comments.push({
                        posted: doc.posted,
                        by: doc.parent_profile,
                        content: doc.content
                      });
                      cb();
                    })
                })
              });
              async.parallel(calls, function(err, result){
                if(err){
                  console.log(err);
                  return;
                }
                console.log('sending messages', comments);
                client.emit('message:list', {
                  message_list: comments
                });
              })
            })
        })
    });

    client.on('discussion:new', function(data){
      console.log('got a discussion:new');
      console.log(data);


      try {
        var newd = new Discussion({
          title: data.title,
          description: data.desc,
          parent_id: data.group
        });

        var error = false;

        var newcom = new Comment({
          content: data.text,
          parent_profile: data.profile,
          parent_comment: newd._id,
        });
        newd.comment = newcom._id;
        newd.save(function(err){
          if(err) {
            console.log(err);
            error = true;
          }
        });
        newcom.save(function(err){
          if(err) {
            console.log(err);
            error = true;
          }
        });

        Group
          .findById(data.group)
          .exec(function(err, doc){
            doc.discussion_list.push(newd._id);
            doc.save(function(err){
              if(err) {
                console.log(err);
                error = true;
              }
            });
            for(i in doc.subscribed_profiles){
              for(j in websockets){
                if(doc.subscribed_profiles[i] == websockets[j].profile){
                  console.log(doc.subscribed_profiles[i], ' is subscribed to that group, sending them the new message');
                  client.emit('discussion:new', data);
                }
              }
            }
          });

        if(error){
          res.sendStatus(500);
        } else {
          res.send('success');
        }
      } catch (e) {
        console.log(e);
      } finally {

      }




      // Group
      //   .findOne({
      //     _id: data.group
      //   })
      //   .exec(function(err, doc){
      //     if(err){
      //       console.log(err);
      //       return;
      //     }
      //     if(!doc){
      //       console.log("no group found");
      //       return;
      //     }
      //     c = new Comment({
      //       content: data.text,
      //       parent_profile: data.profile,
      //     });
      //     c.save();
      //     d = new Discussion({
      //       parent_id: doc._id,
      //       comment: c._id,
      //       title: data.title,
      //       description: data.desc
      //     });
      //     d.save();
      //     doc.discussion_list.push(d._id);
      //     doc.save();
      //   });
    });
    return
  });

} catch (e) {

} finally {

}


// database connection
var mongoose = require('mongoose');
mongoose.connect(configDB.url);

//setup express with passport
require('./config/passport')(passport); // pass passport for configuration
app.use(require('express-session')({
    secret: 'ilovescotchscotchyscotchscotch',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//import account model
//var Account = require('./app/models/account');

// view engine setup
var exphbs  = require('express-handlebars');
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
  }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// controller setup
fs.readdirSync('./app/controllers').forEach(function (file) {
  if(file.substr(-3) == '.js') {
    console.log('registering controller ' + file);
    route = require('./app/controllers/' + file);
    route.controller(app, passport);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// allow CORS
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

module.exports = app;

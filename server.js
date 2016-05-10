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
var multer        = require('multer');

//models
var Group         = require('./app/models/group.js');
var Discussion    = require('./app/models/discussion.js');
var Comment       = require('./app/models/comment.js');
var Profile       = require('./app/models/profile.js');

var app = express();

//setup for image upload

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    //console.log(req.originalUrl.split('/').pop());
    var profile = req.originalUrl.split('/').pop();
    var newName = profile + '.jpg';
    Profile.findOne({
      name: profile
    })
    .exec(function(err, doc){
      if(err || !doc || typeof doc === "undefined"){
        console.log("error updating profile image path");
        if(err) console.log(err);
      } else {
        doc.profile_picture_path = 'uploads/' + newName;
        doc.save();
      }
    });
    callback(null, newName);
  }
});
var upload = multer({ storage : storage }).single('userImage');
app.post('/image_upload/:profile', function(req,res){
  upload(req,res,function(err) {
    console.log('got an image upload request');
    if(err) {
        console.log(err);
        return res.end("Error uploading file.");
    }
    //console.log(req.body);
    //console.log(req.files);
    //res.end("File is uploaded");
    res.redirect('/profile/' + req.params.profile + '/view');
  });
});

//socket io setup

var server   = require('http').Server(app);
var io       = require('socket.io')(8080);
var websockets = {};
var socket_count = 0;

io.on('connection', function(client){

  client.on('init', function(data){
    console.log('got an init from client:', client.id, ' with profile:', data.profile);
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

  client.on('discussion:clear', function(data){
    client.discussion = undefined;
  });

  client.on('chat:new', function(data){
    console.log(client.profile, 'sent new chat message', data);
    Discussion //find the discussion the message was sent to
      .findOne({
        _id: data.discussion._id
      })
      .exec(function(err, discussion){
        if(err || typeof discussion === "undefined" || !discussion){
          console.log("error finding discussion");
          console.log(err);
          console.log(discussion);
          return;
        }
        Comment//find the OP of the discussion
          .findOne({
            _id: discussion.comment
          })
          .exec(function(err, comment){
            if(err || !comment){
              console.log("error finding comment");
              console.log(err);
              return;
            }
            newComm = new Comment({
              content: data.text,
              parent_profile: client.profile,
              parent_comment: comment._id,
            });
            newComm.save();
            comment.comment_list.push(newComm._id);
            comment.save();

            console.log('data.discussion._id',data.discussion._id);
            //  console.log('websockets',websockets);
            //var profiles = [];
            var calls = [];
            //var profiles_with_group = [];
            for(i in websockets){
              console.log('i', i, websockets[i].profile);
              //console.log('websockets[i]', websockets[i]);
              //console.log('websockets[i].client.discussion._id', websockets[i].discussion._id);
              //first send a message to any clients that are in the chat
              if(typeof websockets[i].discussion !== "undefined"){
                console.log(websockets[i].discussion);
                if(websockets[i].discussion._id == data.discussion._id){
                  console.log(websockets[i].profile, 'is in discussion', websockets[i].discussion._id, "and is getting message", newComm);
                  //newComm.translateMarkdown();
                  websockets[i].emit('message:new', newComm);
                  continue;
                }
                //TODO:
                //user is in chat and there is a message to another discussion in the same group
                console.log(websockets[i].profile, 'is in chat',websockets[i].discussion._id,'and there is a message to another discussion');
                var name = websockets[i].profile;
                var j = i;
                //next send a message to any clients that are subscribed to the group
                //but not in any discussion
                //pack all the db calls into a list
                calls.push(function(callback){
                  console.log('looking up', name);
                  Profile.findOne({
                    name: name
                  }).exec(function(err, profile){
                    if(err) console.log(err);
                    if(typeof profile === "undefined") {
                     console.log('could not find profile', name);
                     return;
                    }
                    console.log('is discussion.parent_id in profile.subscribed_groups?');
                    //is the user subscribed to the group this message was sent to?
                    //discussion.parent_id is the discussion that just got a new message
                    console.log(discussion.parent_id.toString(), profile.subscribed_groups);
                    for(k in Object.keys(profile.subscribed_groups)){
                     if(typeof profile.subscribed_groups[k] === "undefined" || !(profile.subscribed_groups[k])){
                       continue;
                     }
                     console.log(profile.subscribed_groups[k].toString());
                     console.log(client.profile);
                     console.log(websockets[j].profile);
                     console.log(name);
                     if(discussion.parent_id.toString() == profile.subscribed_groups[k].toString() ){
                       if(websockets[j].id == client.id){
                         console.log('not sending to client that sent message', client.profile);
                         continue;
                       }
                       console.log('sending group:new_message to', websockets[j].profile);
                       websockets[j].emit('group:new_message', {
                         group: discussion.parent_id,
                         discussion: discussion._id
                       });
                       return;
                     } else {
                       console.log(discussion.parent_id.toString(), 'not equal to', profile.subscribed_groups[k].toString());
                     }
                    }
                    callback();
                  });
                });
              } else {
                console.log(websockets[i].profile, 'is not in a discussion');
                var name = websockets[i].profile;
                var j = i;
                //next send a message to any clients that are subscribed to the group
                //but not in any discussion
                //pack all the db calls into a list
                calls.push(function(callback){
                  console.log('looking up', name);
                  Profile.findOne({
                    name: name
                  }).exec(function(err, profile){
                    if(err) console.log(err);
                    if(typeof profile === "undefined") {
                     console.log('could not find profile', name);
                     return;
                    }
                    console.log('is discussion.parent_id in profile.subscribed_groups?');
                    //is the user subscribed to the group this message was sent to?
                    //discussion.parent_id is the discussion that just got a new message
                    console.log(discussion.parent_id.toString(), profile.subscribed_groups);
                    for(k in Object.keys(profile.subscribed_groups)){
                     if(typeof profile.subscribed_groups[k] === "undefined" || !(profile.subscribed_groups[k])){
                       continue;
                     }
                     console.log(profile.subscribed_groups[k].toString());
                     if(discussion.parent_id.toString() == profile.subscribed_groups[k].toString() ){
                       if(websockets[j].id == client.id){
                         console.log('not sending to client that sent message', client.profile);
                         continue;
                       }
                       console.log('sending group:new_message to', websockets[j].profile);
                       websockets[j].emit('group:new_message', {
                         group: discussion.parent_id,
                         discussion: discussion._id
                       });
                       return;
                     } else {
                       console.log(discussion.parent_id.toString(), 'not equal to', profile.subscribed_groups[k].toString());
                     }
                    }
                    callback();
                  });
                });
              }
            }
            console.log('starting async calls with calls length = ', calls.length);
            async.parallel(calls, function(err, result){
              if(err) console.log(err);
            })
          });

      });
  })

  client.on('discussion:get_messages', function(data){
    console.log(client.profile, 'is asking for messages from discussion', data.discussion);
    client.discussion = data.discussion;
    Discussion.findOne({
        _id: data.discussion._id
    })
    .exec(function(err, disc){
      if(err || !disc || typeof disc === "undefined"){
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
                  //doc.translateMarkdown();
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
          console.log('error saving new discussion');
          console.log(newd);
        }
      });
      //newcom.translateMarkdown();
      newcom.save(function(err){
        if(err) {
          console.log(err);
          error = true;
          console.log('error saving new comment');
          console.log(newcom);
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
                websockets[j].emit('discussion:new', {
                  text: newcom.content,
                  parent_profile: newcom.parent_profile,
                  _id: newd._id,
                  posted: newcom.posted,
                  title: newd.title,
                  desc: newd.description
                });
              }
            }
          }
        });

      if(error){
        client.emit('error', {error:error});
      }
    } catch (e) {
      console.log(e);
    } finally {

    }
  });
});





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

# babble
A forum for chatting, or a chat client for making forums


> ## install
> https://github.com/sterlingbaldwin/babble.git

> cd babble

> npm install

> npm start



# project notes
Ive decided to use [this guys](http://timstermatic.github.io/blog/2013/08/17/a-simple-mvc-framework-with-node-and-express/) idea for a node/express MVC.

working on getting [passport to work](http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/).


Folder structure is then laid out

> ./babble

>  |-> /controllers  _all controller files_

>  |-> /views  _all view templates_

>  |-> /models  _all database models_


The app.js loads all controllers, which define all their own routes.

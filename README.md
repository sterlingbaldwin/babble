# babble
A forum for chatting, or a chat client for making forums


> ## install
> https://github.com/sterlingbaldwin/babble.git

> cd babble
> ## CHANGE THE SESSION SECRET!
> npm install

> npm start



# project notes and links
Ive decided to use [this guys](http://timstermatic.github.io/blog/2013/08/17/a-simple-mvc-framework-with-node-and-express/) idea for a node/express MVC.

working on getting [passport to work](http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/).

[more on passport](https://scotch.io/tutorials/easy-node-authentication-setup-and-local)
[stackoverflow on passport](http://stackoverflow.com/questions/15711127/express-passport-node-js-error-handling)

Folder structure is then laid out

> ./babble

>  |-> /controllers  _all controller files_

>  |-> /views  _all view templates_

>  |-> /models  _all database models_


The app.js loads all controllers, which define all their own routes.

# babble
A forum for chatting, or a chat client for making forums


> ## install
> https://github.com/sterlingbaldwin/babble.git\s
> cd babble\s
> npm install\s
> npm start\s


# project notes
Ive decided to use [this guys](http://timstermatic.github.io/blog/2013/08/17/a-simple-mvc-framework-with-node-and-express/) idea for a node/express MVC.

Folder structure is then laid out

> ./babble\s
>  |\s
>  |-> /controllers  _all controller files_\s
>  |\s
>  |-> /views  _all view templates_\s
>  |\s
>  |-> /models  _all database models_\s


The app.js loads all controllers, which define all their own routes.

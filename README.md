# babble
A forum for chatting, or a chat client for making forums


> ## install
> https://github.com/sterlingbaldwin/babble.git\s\s
> cd babble\s\s
> npm install\s\s
> npm start\s\s


# project notes
Ive decided to use [this guys](http://timstermatic.github.io/blog/2013/08/17/a-simple-mvc-framework-with-node-and-express/) idea for a node/express MVC.

Folder structure is then laid out

> ./babble\s\s
>  |\s\s
>  |-> /controllers  _all controller files_\s\s
>  |\s\s
>  |-> /views  _all view templates_\s\s
>  |\s\s
>  |-> /models  _all database models_\s\s


The app.js loads all controllers, which define all their own routes.

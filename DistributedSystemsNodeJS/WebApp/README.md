# Web Apps
By now, you have mastered seveal approaches to handling asynchronous JavaScript code.  You know how to use and write RESTful web services.  You understand messaging patterns, and how to use Express.  With all of that knowledge and experience, we are now in position to develop a web application.  This will take us through the following Node.js aspects:
-------------------------------------------------------------------------------

- Architecture and Core
  - At this stage you have moved past the Node.js core in many respects.  Node is the underlying technology that is letting you reach beyond.

- Patterns
  - You will dive deeper into Express middleware, using it to implement a custom authentication handler.  We will use passport--an Express plug-in--so that users of our application can log in with their Google accounts.  The client-side code uses model-view-controller(MVC) to separate concerns.

- JavaScriptisms
  - You'll learn some differences between ECMAScript 5 and 6 as we code JavaScript for the browser.  You will also use jQuery to perform a variety of client-side operations.

- Supporting Code
  - Just like npm makes it esy to pull in Node modules, *Bower* is used to manage client-side dependencies.  We will use bower to pull in jQuery, Bootstrap, Handlebars, and others.  We will also use Redis, a fast key-value store, for managing session data.

# Storing Express Sessions in Redis
- A *session* is data that is attached to a particular user.
# IntercomAnalytics

In order to perform analytics on aggregate events in intercom a custom tool is required since itercom's UI only allows event analytics on a per-user basis.
IntercomAnalytics will pull all the events stored in your intercom app and provide counts of specified events as well dump a CSV file of events to perform more advanced analysis on.  

Electron, Angular and the official intercom-client for Node.js are used to accomplish this. (with extensions to intercom-client to use the Events APIs not supported by the client)
Tested on Windows.

![Screenshot](resources/common/screenshot.png?raw=true "Screenshot")

#Install
--- 

Install dependencies.

```
npm install
```

Install bower dependencies 

```
bower install
```

Install Application dependencies:

Change directory to ```app``` folder, then run

```
npm install
```


#Run 
---

Run your application by entering following command in your command prompt

```
gulp run
```

#Release
---

You can get the release version with following command:

```
gulp build-electron
```

# Acknowledgments

Electron boilerplate taken from https://github.com/jasimea/ElectronAngular

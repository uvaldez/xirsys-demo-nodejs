# xirsys-demo-nodejs
XirSys Webrtc API using nodejs and expressjs
https://xirsys.com

to use your own credentials go to xirsys_connect.js and change the following lines:
```javascript
var xirsysConnect = {
	secureTokenRetrieval : false,
	data : {
		domain : '< www.yourdomain.com >',
		application : 'default',
		room : 'default',
		ident : '< Your username (not your email) >',
		secret : '< Your secret API token >',
		secure : 1
	}
};
```

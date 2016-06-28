// 'ident' and 'secret' should ideally be passed server-side for security purposes.
// If secureTokenRetrieval is true then you should remove these two values.

// Insecure method
var xirsysConnect = {
	secureTokenRetrieval : false,
	data : {
		domain : 'www.agilityfeat.com',
		application : 'default',
		room : 'default',
		ident : 'uzielvaldez',
		secret : 'ba3c59fe-3cf5-11e6-a0e5-098d7b5222be',
		secure : 1
	}
};

// Secure method
/*var xirsysConnect = {
	secureTokenRetrieval : true,
	server : '../getToken.php',
	data : {
		domain : '< www.yourdomain.com >',
		application : 'default',
		room : 'default',
		secure : 1
	}
};*/

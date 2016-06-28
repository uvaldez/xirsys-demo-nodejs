'use strict';

window.onload = function () {

  // Getting references to page DOM for signalling.
  var peersEl = document.getElementById('peers'),
    loginEl = document.getElementById('login'),
    logOutEl = document.getElementById('log-out'),
    usernameEl = document.getElementById('username'),
      usernameLabelEl = document.getElementById('username-label'),
    messageEl = document.getElementById('message'),
    sendMessageEl = document.getElementById('sendMessage'),
    messagesEl = document.getElementById('messages');

  // Getting references to page DOM for video calling.
  var callPeerEl = document.getElementById('call-peer'),
    hangUpEl = document.getElementById('hang-up'),
    localVideoEl = document.getElementById('local-video'),
    remoteVideoEl = document.getElementById('remote-video'),
    localFullScreenEl = document.getElementById('local-full-screen'),
    remoteFullScreenEl = document.getElementById('remote-full-screen');

  var automaticAnswer = false;

  // Create a p2p object. Pass a proxy server with your ident and
  // secret if you intend to connect securely.// Settings for video calling.
  var p = new $xirsys.p2p(
    (xirsysConnect.secureTokenRetrieval === true) ?
      xirsysConnect.server : null,
    {
      audio: true,
      video: true
    },
    localVideoEl,
    remoteVideoEl
  );

  var username = '';

    /* User interface handler functions */

  // When the connect button is clicked hide log-in, check the user-
  // name is valid, cancel automatic answers (see xirsys.p2p.js
  // onSignalMessage method) and open a connexion to the server.
  loginEl.onsubmit = function ($event) {
    $event.preventDefault();
    username = usernameEl.value.replace(/\W+/g, '');
    if (!username || username == '') {
      return;
    }
    loginEl.parentNode.style.visibility = 'hidden';
    logOutEl.style.visibility = 'visible';
    var connectionProperties = xirsysConnect.data;
    connectionProperties.username = username;
    connectionProperties.automaticAnswer = automaticAnswer;
    p.open(connectionProperties);
  }

  // Log out and reset the interface.
  logOutEl.onclick = function ($event) {
    $event.preventDefault();
    username = '';
    while (usernameLabelEl.hasChildNodes()) {
      usernameLabelEl.removeChild(usernameLabelEl.lastChild);
    }
    usernameLabelEl.appendChild(document.createTextNode('[Not logged in]'));
    login.parentNode.style.visibility = 'visible';
    logOutEl.style.visibility = 'hidden';
    removeAllPeers();
    p.hangUp();
    detachMediaStream(localVideoEl);
    p.close();
  }

  // Send a message to one or all peers.
  sendMessageEl.onsubmit = function ($event) {
    $event.preventDefault();
    if (!p.signal) {
      addMessage('You are not yet connected to the signalling server');
      return;
    }
    var peer = selectedPeer();
    if (!!peer) {
      p.signal.send('message', message.value, peer);
    } else {
      p.signal.send('message', message.value);
    }
    addMessage((!!peer) ? 'To ' + peer : 'To all peers', messageEl.value);
    messageEl.value = '';
  }

  // Initiates a call, if a single peer has been selected.
  callPeerEl.onclick = function () {
    var peerName = selectedPeer();
    if (!!peerName) {
      p.call(peerName);
      addMessage('Calling ' + peerName);
      // N.B. This demo doesn't include a method for noting
      // rejected calls. This could be added in the demo by
      // sending a message when rejecting the call, but it would
      // be preferable to extend the xirsys.p2p class to
      // automatically emit an event to the same effect.
    } else {
      addMessage('Error', 'You must select a single peer before initiating a call');
    }
  }

  // Ends current call, if any.
  hangUpEl.onclick = function () {
    p.hangUp();
    //addMessage('Hanging up');
    // N.B. As this function is 'dumb' (in that it doesn't need to
    // know if we are in a call as that is handled by the p2p class)
    // it is not appropriate to add a message.
    // This demo also does not include a method for noting calls
    // ended by the other party or by connexion difficulties.
    // See 'callPeer.onclick' above for similar.
  }

  // Requesting full screen.
  localFullScreenEl.onclick = function ($evt) {
    fullScreenVideo(localVideoEl);
  }
  remoteFullScreenEl.onclick = function ($evt) {
    fullScreenVideo(remoteVideoEl);
  }

    /* Other interface functions */

  // When a peer connects check to see if it is the user. If it is
  // update the user's label element. If it is not check if the peer
  // is already listed and add an element if not.s
  var addPeer = function ($peerName) {
    if ($peerName == username) {
      while (usernameLabelEl.hasChildNodes()) {
        usernameLabelEl.removeChild(usernameLabelEl.lastChild);
      }
      usernameLabelEl.appendChild(document.createTextNode(stripLeaf($peerName)));
    } else {
      if (!document.getElementById('peer-' + $peerName)) {
        var nodeEl = document.createElement('div'),
          btnEl = document.createElement('input');
        btnEl.setAttribute('type', 'radio');
        btnEl.setAttribute('name', 'peer');
        btnEl.setAttribute('value', $peerName);
        nodeEl.appendChild(btnEl);
        nodeEl.appendChild(document.createTextNode(stripLeaf($peerName)));
        nodeEl.id = 'peer-' + $peerName;
        nodeEl.className = 'peer';
        peersEl.appendChild(nodeEl);
      }
    }
  };

  // Removes peer elements from the page when a peer leaves.
  var removePeer = function ($peerName) {
    var nodeEl = document.getElementById('peer-' + $peerName);
    peersEl.removeChild(nodeEl);
  };

  // For resetting the peers list, leaving the __all__ selector only.
  var removeAllPeers = function () {
    var selectors = peersEl.getElementsByTagName('div'),
      peerSelectors = [];
    for (var i = 0; i < selectors.length; i++) {
        if (selectors[i].className.indexOf('peer') !== -1) {
        peerSelectors.push(selectors[i]);
      }
    }
    for (var i = 0; i < peerSelectors.length; i++) {
      peersEl.removeChild(peerSelectors[i]);
    }
  };

  // Get the name of the peer the user has selected.
  var selectedPeer = function () {
    var peerEl = document.getElementsByName('peer');
    for (var i=0, l=peerEl.length; i<l; i++) {
      if (peerEl[i].checked) {
        return (peerEl[i].value == '__all__') ?
          undefined : peerEl[i].value;
      }
    }
  };

  // Add a message to the conversation.
  var addMessage = function ($msgLeader, $msgTrail) {
    var msgEl = document.createElement('div'),
      leaderEl = document.createElement('strong');
    leaderEl.appendChild(document.createTextNode('[' + formattedTime() + '] ' + $msgLeader));
    msgEl.appendChild(leaderEl);
    if (!!$msgTrail) {
      msgEl.appendChild(document.createTextNode(': ' + $msgTrail));
    }
    messagesEl.appendChild(msgEl);
    messagesEl.parentNode.scrollTop = messagesEl.parentNode.scrollHeight;
  };

  // Returns a peer name without the room and application details.
  // This function may now be redundant as the format of messages from
  // the Xirsys server has changed.
  var stripLeaf = function ($p) {
    return $p.substr($p.lastIndexOf('/')+1)
  };

  // Returns neatly formatted digital clock style time.
  // As this demo doesn't store messages we are assuming dates are not
  // relevent information.
  var formattedTime = function () {
    var t = new Date();
    return ( '0' + t.getHours() ).slice( -2 ) + ':' +
      ( '0' + t.getMinutes() ).slice( -2 ) + ':' +
      ( '0' + t.getSeconds() ).slice( -2 );
  };

  // Deal with an incoming call.
  // If you've turned off automatic responses then listen to call
  // offers and allow the user to decide whether to respond or not.
  // Else calls are automatically answered (see xirsys.p2p.js).
  var callIncoming = function ($peer, $data) {
    if (automaticAnswer === false) {
      if (confirm('Take a call from ' + $peer + '?')) {
        p.answer($peer, $data);
        addMessage('Taking a call from ' + $peer);
      } else {
        addMessage('Call from ' + $peer + ' rejected');
      }
    } else {
      addMessage('Taking a call from ' + $peer);
    }
  }

  // Full-screens any HTML5 video on the page.
  var fullScreenVideo = function ($video) {
    if ($video.requestFullscreen) {
      $video.requestFullscreen();
    } else if ($video.webkitRequestFullscreen) {
      $video.webkitRequestFullscreen();
    } else if ($video.mozRequestFullScreen) {
      $video.mozRequestFullScreen();
    } else if ($video.msRequestFullscreen) {
      $video.msRequestFullscreen();
    }
  }

    /* Watching for and responding to XSDK events */

  var events = $xirsys.events.getInstance();

  // We get this when we login. There may be zero
  // to many peers at this time.
  events.on($xirsys.signal.peers, function ($evt, $msg) {
    for (var i = 0; i < $msg.users.length; i++) {
      addPeer($msg.users[i]);
    }
  });

  // When a peer connects to signalling, we
  // get notified here.
  events.on($xirsys.signal.peerConnected, function ($evt, $msg) {
    addPeer($msg);
  });

  // When a peer disconnects from the signal server we get notified.
  events.on($xirsys.signal.peerRemoved, function ($evt, $msg) {
    removePeer($msg);
  });

  // When a peer sends you (or you and all other peers) a message.
  events.on($xirsys.signal.message, function ($evt, $msg) {
    if ($msg.sender != name) {
      addMessage('From ' + stripLeaf($msg.sender), $msg.data);
    }
  });

  // When a peer offers you a connexion for a video call.
  events.on($xirsys.p2p.offer, function ($evt, $peer, $data) {
    callIncoming($peer, $data);
  });

  // Log errors in the terminal.
  events.on($xirsys.signal.error, function ($evt, $msg) {
    console.error('error: ', $msg);
    addMessage('Error', 'There has been an error in the server connection');
  });

}

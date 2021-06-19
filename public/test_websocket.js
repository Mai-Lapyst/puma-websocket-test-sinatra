var eventLog = document.getElementById('eventLog');
var sendText = document.getElementById('sendText');

function log_msg(msg) {
    console.log(msg);
    var p = document.createElement('div');
    p.innerText = msg;
    eventLog.appendChild(p);
}

function error_msg(msg) {
    console.error(msg);
    var p = document.createElement('div');
    p.className = "error";
    p.innerText = msg;
    eventLog.appendChild(p);
}

function send_text() {
    var text = sendText.value;
    if ($socket != null) {
        log_msg("send text: '" + text + "'");
        $socket.send(text);
    }
}

var $socket = null;
var $timeout_id = null;

function disconnect(print = true) {
    if ($socket != null) {
        if (print) {
            log_msg("disconnecting");
        }
        $socket.close();
        $socket = null;
        clearTimeout($timeout_id);
        $timeout_id = null;

        document.getElementById('disconnectBtn').setAttribute('disabled','');
        document.getElementById('connectBtn').removeAttribute('disabled');
        document.getElementById('sendText').setAttribute('disabled','');
        document.getElementById('sendBtn').setAttribute('disabled','');
    }
}

var $ping_enabled = false;

function changePingCb() {
    $ping_enabled = !$ping_enabled;
    if ($ping_enabled) {
        document.getElementById('pingBtn').innerText = "Disable ping/pong messages";
        if ($socket != null) {
            log_msg("send ping");
            $socket.send("ping");
        }
    } else {
        document.getElementById('pingBtn').innerText = "Enable ping/pong messages";
        if ($timeout_id != null) {
            clearTimeout($timeout_id);
            $timeout_id = null;
        }
    }
}

function connect(port) {
    if ($socket != null) {
        log_msg("disconnect due to reconnecting...");
        disconnect(false);
    }

    // window.location.hostname
    var url = `ws://localhost:${port}/ws-echo`;
    console.log("url:", url);

    $socket = new WebSocket(url);

    $socket.onopen = function(ev) {
        log_msg("connection established");
        if ($ping_enabled) {
            log_msg("send ping");
            $socket.send("ping");
        }

        document.getElementById('connectBtn').setAttribute('disabled','');
        document.getElementById('disconnectBtn').removeAttribute('disabled');
        document.getElementById('sendText').removeAttribute('disabled');
        document.getElementById('sendBtn').removeAttribute('disabled');
    };

    $socket.onerror = function(ev) {
        //error_msg("got error");
        console.error("got error: ", ev);
    };

    $socket.onclose = function(ev) {
        //log_msg("connection closed");
        console.log("connection closed", ev);
        disconnect(false);
    }

    $socket.onmessage = function(ev) {
        if (ev.data == "pong" && ($timeout_id == null || $ping_enabled)) {
            log_msg("recieved pong");
            $timeout_id = setTimeout(() => {
                log_msg("send ping");
                $socket.send("ping");
                $timeout_id = null;
            }, 1000);
            return;
        }
        log_msg("recieved message: '" + ev.data + "'");
    }

}

activate_control_app "tcp://127.0.0.1:9293"
bind "unix://./puma.sock"
pidfile "./puma.pid"
state_path "./puma.state"

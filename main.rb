require 'sinatra'
require 'puma/plugin/websockets'

set :public_folder, './public'

class EchoHandler
    def on_open(con)
        puts "Recived open event: #{con}"
    end

    def on_close(con)
        puts "Recived close event: #{con}"
    end

    def on_message(con, data)
        puts "Recived message event: #{con} | #{data.inspect}"
    end
end

get "/" do
    redirect "/test_websocket.html"
end

get "/ws-echo" do
    if env["rack.upgrade?"] == :websocket then
        env["rack.upgrade"] = EchoHandler.new()
    else
        halt 400, "cannot handle: no websocket"
    end
end

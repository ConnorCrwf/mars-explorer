#!/usr/bin/env python
import threading
import SocketServer
import fileinput
import time
from socket_thread import ClientThread


class ThreadedTCPRequestHandler(SocketServer.BaseRequestHandler):
    def handle(self):
        client_ports = [int(port) for port in
                        str(self.request.recv(1024)).split(',')]
        self.request.sendall('1')
        time.sleep(1)

        threads = []
        for client_port in client_ports:
            threads.append(ClientThread(self.client_address[0], client_port))

        for thread in threads:
            thread.start()


class ThreadedTCPServer(SocketServer.ThreadingMixIn, SocketServer.TCPServer):
    pass

if __name__ == "__main__":
    HOST, PORT = "localhost", 8000

    server = ThreadedTCPServer((HOST, PORT), ThreadedTCPRequestHandler)
    ip, port = server.server_address

    # Start a thread with the server -- that thread will then start one
    # more thread for each request
    server_thread = threading.Thread(target=server.serve_forever)
    # Exit the server thread when the main thread terminates
    server_thread.daemon = True
    server_thread.start()
    print("Server loop running in thread:", server_thread.name)

    for line in fileinput.input():
        pass

    server.shutdown()
    server.server_close()

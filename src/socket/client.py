#!/usr/bin/env python
import socket
from socket_thread import ServerThread


def client(server_host, server_port, client_ports):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((server_host, server_port))
    try:
        sock.sendall(','.join(str(port) for port in client_ports))

        response = str(sock.recv(1024))
        if response != '1':
            return

        print "Client connected"

        threads = []
        for port in client_ports:
            threads.append(ServerThread(port=port))

        for thread in threads:
            thread.start()

        for thread in threads:
            thread.join()

    finally:
        sock.close()

if __name__ == "__main__":
    host, port = 'localhost', 8000
    client_ports = (8001, 8002)
    client(host, port, client_ports)

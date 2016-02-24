import threading
import socket
import random


class SocketThread(threading.Thread):
    def __init__(self, host='localhost', port=0):
        self.host = host
        self.port = port
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        threading.Thread.__init__(self)

    def run(self):
        pass


class ServerThread(SocketThread):
    def run(self):
        self.socket.bind((self.host, self.port))
        self.socket.listen(1)
        connection, address = self.socket.accept()
        data = connection.recv(1024)
        print data


class ClientThread(SocketThread):
    def run(self):
        print (self.host, self.port)
        self.socket.connect((self.host, self.port))
        self.socket.sendall(str(random.randint(1, 100)))

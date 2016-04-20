# Mars Explorer
Robotic Exploration of the Next Frontier STEM Activity

Build a Raspberry Pi rover and move it around using Leap Motion. The camera feed will detect and identify AR markers which represent resources you might find on Mars.

## Prerequisites
Before you begin, make sure you have the required hardware and software.

### Hardware
The two basic hardware components are the control station and the rover. The augmented reality markers are optional.
#### Control Station
The control station is run from a computer. It will work on all major operating systems and can even run on a Raspberry Pi.
To open the web interface, you must use a modern web browser. The interface works best on Firefox 45+.
#### Rover
Each rover should have a:
- [Raspberry Pi](https://www.raspberrypi.org) (tested on 'RPI 2 Model B' and 'RPI 1 Model B+', but it should work on all models)
- [RasPiRobot](http://www.monkmakes.com/rrb3) (v3)
- [Raspberry Pi Camera](https://www.raspberrypi.org/products/camera-module)
- Ultrasonic sensor
- WiFi adapter
- Motor and wheels

Once all parts are connected and working, the Raspberry Pi should be turned on and configured based on the next section. For instructions on the hardware setup, please refer to the hardware setup.

#### Augmented Reality (AR) Markers
Print [these markers](https://github.com/artoolkit/artoolkit5/tree/master/doc/patterns/Matrix%20code%203x3%20with%20Hamming%20%286%2C3%29%20code%20%2872dpi%29), ensuring there is a white border around the black square.

### Software
#### Control Station
- [Python 2](https://www.python.org/downloads) (**NOTE**: This code has not been tested using Python 3)
- [Crossbar](http://crossbar.io)

#### Rover
These instructions assume you are using the latest version of Raspian.
- [rrb3](https://pypi.python.org/pypi/rrb3)
- [autobahn](http://autobahn.ws/python)
- [RPi Cam Web Interface](http://elinux.org/RPi-Cam-Web-Interface)

## Setup and Run
### Control Station
- Set computer to use a static IP address (```192.168.1.200```)
- Once the control station computer is connected to the internet, run the following in a terminal:
```
git clone http://github.com/joemirizio/mars-explorer
cd mars-explorer
crossbar start
```
- In a browser, navigate to [http://localhost:8080](http://localhost:8080)

### Rover
- Turn on the Raspberry Pi and connect it to your WiFi network.
- Configure a static IP address (```192.168.1.20X```) where ```X``` is the ID of the robot. Refer to [this tutorial](https://www.modmypi.com/blog/tutorial-how-to-give-your-raspberry-pi-a-static-ip-address) for detailed instructions. If you choose to use a different subnet based on your WiFi router's configuration, make sure to update the code accordingly.
- To start, run ```/home/pi/mars-explorer/bin/run_rover.sh``` in a terminal.
- **[OPTIONAL]** To run the rover automatically on startup, open a terminal and run: 
```
sudo -s "echo '/home/pi/mars-explorer/bin/run_rover.sh' > /etc/rc.local"
```

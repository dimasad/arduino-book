struct Ultrasonic {int trig; int echo;};
Ultrasonic u_left;
Ultrasonic u_right;

void ultrasonic_begin(Ultrasonic* sensor, int trig, int echo) {
  sensor->trig = trig; // Saves the trigger pin number on the sensor object
  sensor->echo = echo; // Saves the echo pin number on the sensor object
  pinMode(trig, OUTPUT); // Configures the trigger pin
  pinMode(echo, INPUT);  // Configures the echo pin
}

int ultrasonic_read(Ultrasonic* sensor) {
  constexpr long timeout_us = 20000; //Maximum wait for echo, in microseconds

  // Trigger the reading
  digitalWrite(sensor->trig, HIGH);
  digitalWrite(sensor->trig, LOW);

  // Wait for burst to be sent
  while (digitalRead(sensor->echo) == LOW) {}

  // Save start time in microseconds
  long start = micros();

  // Wait for echo arrival to be signalled or timeout to occur
  while (digitalRead(sensor->echo) && micros() - start < timeout_us) {}

  // Calculate the time of flight, convert it to distance, and return
  long time_of_flight = micros() - start;
  int distance_centimeters = time_of_flight / 58;
  return distance_centimeters;
}

void setup(){
  Serial.begin(9600); //Initialize the serial port
  ultrasonic_begin(&u_left, 3, 4); // The left sensor is connected to pins 3 & 4
  ultrasonic_begin(&u_right, 5, 6);//The right sensor is connected to pins 5 & 6
}

void loop(){
  Serial.print("right range:");
  Serial.print(ultrasonic_read(&u_right));
  Serial.print(", left range:");
  Serial.println(ultrasonic_read(&u_left));
  delay(1000);
}
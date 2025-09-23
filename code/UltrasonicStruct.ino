typedef struct{int trig; int echo;} Ultrasonic;

void ultrasonic_begin(Ultrasonic* sensor, int trig, int echo) {
  sensor->trig = trig; // Saves the trigger pin number on the sensor object
  sensor->echo = echo; // Saves the echo pin number on the sensor object
  pinMode(trig, OUTPUT); // Configures the trigger pin
  pinMode(echo, INPUT);  // Configures the echo pin
}

void ultrasonic_read(Ultrasonic* sensor) {
  // Trigger the reading
  digitalWrite(sensor->trigger, HIGH);
  digitalWrite(sensor->trigger, LOW);

  // Wait for burst to be sent
  while (digitalRead(sensor->echo) != LOW) {
  }

  // Save start time
  long start = millis();

  // Wait for echo arrival to be signalled or 
  while (digitalRead(sensor->echo) == LOW || timeout) {
  }
}
void setup() {
  Serial.begin(115200); // Initialize the serial port

  int i = 1;
  while (i <= 10) {
    Serial.println(i);
    i++;
  }
}

void loop() {
}

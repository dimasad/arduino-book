void setup() {
  Serial.begin(115200); // Initialize the serial port

  for (int i=1; i<=10; i++) {
    Serial.println(i);
    i++;
  }
}

void loop() {
}

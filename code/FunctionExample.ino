int plus2(int x) { // Function that returns the argument plus 2
  return x + 2;
}

void setup() {
  int x = 3;
  int y = plus2(x); // y  <== x + 2

  Serial.begin(115200); // Initialize the serial port

  // Print value of x
  Serial.print("x = "); 
  Serial.println(x);

  // Print value of the function return
  Serial.print("x + 2 = ");
  Serial.println(y);
}

void loop() {
}

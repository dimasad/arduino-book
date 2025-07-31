// Simulate this in https://wokwi.com/projects/438013310346907649

// Global variable declaration
int x = 3;  // Change these values to explore
int y = -2; // how the program behaves.

void setup() {
  Serial.begin(115200); // Initialize the serial port

  if (2*x + y == 4)     // If keyword and conditional expression
    Serial.print("2x + y equals 4");         // Statement when true
  else 
    Serial.print("2x + y does not equal 4"); // Statement when false

  // Normal program flow resumes after the statement when false
  Serial.print(", since x=");
  Serial.print(x);
  Serial.print(" and y=");
  Serial.println(y);
}

void loop() {
}

// Simulate this in https://wokwi.com/projects/437911780438463489

// Global variable declaration
int x = 3;  // Change these values to explore
int y = -2; // how the program behaves.

void setup() {
  Serial.begin(115200); // Initialize the serial port

  if (2*x + y == 4)     // If keyword and expression
  { // Block statement when true
    Serial.print("2x + y equals 4, since x=");
    Serial.print(x);
    Serial.print(" and y=");
    Serial.println(y);
  }

  // Normal program flow resumes after the statement
  // following the paranthesis.
  Serial.println("This will always run.");
}

void loop() {
}

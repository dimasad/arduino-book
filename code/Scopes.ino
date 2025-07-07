int foo = 1; // Declares "foo" in the global scope

void setup() {
  foo = 2; // Assigns 2 to the global variable foo
}

void loop() {
  int bar = 3; // Declares "bar" in the loop function block scope
}

int foo = 1; // Declares "foo" in the global scope

void setup() {
  foo = 2; // Assigns 2 to the global variable foo
  {
    float foo = 3.1415; // Declares new foo in new block
  }
}

void loop() {
}

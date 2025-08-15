void toggle_led() { // Function that toggles the LED state
  digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
}

void setup() {
  pinMode(LED_BUILTIN, OUTPUT); // Call the `pinMode` function with
}                               // arguments LED_BUILTIN and OUTPUT.

void loop() {
  toggle_led(); // Call the `toggle_led` function.
  delay(500);   // Call the `delay` function with argument 500.
}

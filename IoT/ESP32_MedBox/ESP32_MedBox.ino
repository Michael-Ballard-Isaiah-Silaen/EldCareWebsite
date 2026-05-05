#include <WiFi.h>
#include <WiFiClientSecure.h> // Added for HTTPS
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>


Servo servo1;
Servo servo2;


Adafruit_SSD1306 display(128, 32, &Wire, -1);
bool oledReady = false;


// --- WiFi & API Configuration ---
const char* ssid = "Michael";
const char* password = "abcdefgh123";


// Updated endpoints to Vercel production (HTTPS)
const char* loginUrl = "https://eldcarebackend.vercel.app/auth/sign-in";
const char* serverUrl = "https://eldcarebackend.vercel.app/schedules";
const char* notificationUrl = "https://eldcarebackend.vercel.app/notifications";
const char* defaultMedBoxId = "507f1f77bcf86cd799439011";


// Dynamic JWT Token
String jwtToken = "";


// Secure WiFi Client for HTTPS
WiFiClientSecure secureClient;


// --- NTP / RTC Configuration ---
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 25200; // UTC+7 (WIB)
const int   daylightOffset_sec = 0;


// Polling timer for API
unsigned long lastFetchTime = 0;
const unsigned long fetchInterval = 60000; // Fetch data every 60 seconds


// Polling timer for the 10-second clock print
unsigned long lastTimePrint = 0;
const unsigned long timePrintInterval = 10000; // Print time every 10 seconds


// OLED timer
unsigned long lastOledUpdate = 0;
const unsigned long oledUpdateInterval = 1000; // Refresh OLED every 1 second


// Medication pickup flow
const int SERVO_OPEN_ANGLE = 0;
const int SERVO_CLOSED_ANGLE = 90;
const unsigned long pickupCloseDelay = 60000; // Close servo 1 minute after PIR detects motion


// Buzzer reminder flow
const unsigned long buzzerInterval = 5000; // Beep every 5 seconds while waiting for pickup
const unsigned long buzzerBeepDuration = 500;
bool slot1BuzzerActive = false;
bool slot2BuzzerActive = false;
bool slot1BuzzerOn = false;
bool slot2BuzzerOn = false;
unsigned long slot1LastBuzzerBeep = 0;
unsigned long slot2LastBuzzerBeep = 0;
unsigned long slot1BuzzerStartedAt = 0;
unsigned long slot2BuzzerStartedAt = 0;


// Prevent double-triggering within the same minute
String lastTriggeredTimeSlot1 = "";
String lastTriggeredTimeSlot2 = "";


bool slot1WaitingForMotion = false;
bool slot2WaitingForMotion = false;
bool slot1ClosePending = false;
bool slot2ClosePending = false;
unsigned long slot1MotionWaitStartedAt = 0;
unsigned long slot2MotionWaitStartedAt = 0;
unsigned long slot1MotionDetectedAt = 0;
unsigned long slot2MotionDetectedAt = 0;
String activeScheduleIdSlot1 = "";
String activeScheduleIdSlot2 = "";
String activeMedicationNameSlot1 = "";
String activeMedicationNameSlot2 = "";
String activeMedBoxIdSlot1 = "";
String activeMedBoxIdSlot2 = "";
String todayMedicationNameSlot1 = "-";
String todayMedicationNameSlot2 = "-";


// --- Pins ---
const int PIR_1_PIN = 33; 
const int PIR_2_PIN = 32;
const int LED_1_PIN = 18;
const int LED_2_PIN = 19;
const int BUZZER_PIN_1 = 26;
const int BUZZER_PIN_2 = 25;
const int OLED_SDA_PIN = 21;
const int OLED_SCK_PIN = 22;


void setup() {
 Serial.begin(115200);


 // Initialize Pins
 pinMode(PIR_1_PIN, INPUT);
 pinMode(PIR_2_PIN, INPUT);
 pinMode(LED_1_PIN, OUTPUT);
 pinMode(LED_2_PIN, OUTPUT);
 pinMode(BUZZER_PIN_1, OUTPUT);
 pinMode(BUZZER_PIN_2, OUTPUT);


 digitalWrite(LED_1_PIN, LOW);
 digitalWrite(LED_2_PIN, LOW);
 digitalWrite(BUZZER_PIN_1, LOW);
 digitalWrite(BUZZER_PIN_2, LOW);


 // Initialize OLED SSD1306 128x32
 Wire.begin(OLED_SDA_PIN, OLED_SCK_PIN);
 if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
   Serial.println("SSD1306 allocation failed. OLED disabled.");
 } else {
   oledReady = true;
   display.clearDisplay();
   display.setTextSize(1);
   display.setTextColor(SSD1306_WHITE);
   display.setCursor(0, 0);
   display.println("EldCare MedBox");
   display.println("Syncing time...");
   display.display();
 }


 // Initialize Servos
 ESP32PWM::allocateTimer(0);
 ESP32PWM::allocateTimer(1);
 servo1.attach(2, 500, 2400);
 servo2.attach(4, 500, 2400);


 servo1.write(90);
 servo2.write(90);


 // Connect to WiFi
 Serial.print("Connecting to WiFi");
 WiFi.begin(ssid, password);
 while (WiFi.status() != WL_CONNECTED) {
   delay(500);
   Serial.print(".");
 }
 Serial.println("\nWiFi connected.");


 // Configure Secure Client to skip SSL certificate verification
 secureClient.setInsecure();


 // Perform dynamic login
 performLogin();


 // Initialize RTC via NTP
 Serial.println("Syncing time with NTP...");
 configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
 struct tm timeinfo;
 if (getLocalTime(&timeinfo)) {
   Serial.println("Waktu berhasil disinkronisasi.");
 } else {
   Serial.println("Gagal mendapatkan waktu.");
 }


 Serial.println("Sistem siap.");
 delay(1000);
}


void loop() {
 handleBuzzerReminders();
 updateOledClock();
 handlePickupSlot1();
 handlePickupSlot2();
 printCurrentTime();
  unsigned long currentMillis = millis();
 if (currentMillis - lastFetchTime >= fetchInterval || lastFetchTime == 0) {
   lastFetchTime = currentMillis;


   struct tm timeinfo;
   if (getLocalTime(&timeinfo)) {
     char currentDate[11];
     strftime(currentDate, sizeof(currentDate), "%Y-%m-%d", &timeinfo);


     char currentTime[6];
     strftime(currentTime, sizeof(currentTime), "%H:%M", &timeinfo);
     Serial.printf("\n--- Initiating API Fetch at %s %s ---\n", currentDate, currentTime);
     fetchAndProcessSchedules(String(currentDate), String(currentTime));
   }
 }
}


void performLogin() {
 if (WiFi.status() == WL_CONNECTED) {
   Serial.println("Authenticating device with backend...");
   HTTPClient http;
   // Pass the secureClient here
   http.begin(secureClient, loginUrl);
   http.addHeader("Content-Type", "application/json");


   DynamicJsonDocument loginDoc(512);
   loginDoc["email"] = "AmandaAlzena@gmail.com";
   loginDoc["password"] = "123";
   loginDoc["medBoxID"] = 1;
   loginDoc["medBoxPassword"] = "G7!kP2@zR9#vLm4$XqT8";


   String requestBody;
   serializeJson(loginDoc, requestBody);


   int httpResponseCode = http.POST(requestBody);


   if (httpResponseCode == 200 || httpResponseCode == 201) {
     String payload = http.getString();
     DynamicJsonDocument responseDoc(2048);
     DeserializationError error = deserializeJson(responseDoc, payload);


     if (!error) {
       jwtToken = responseDoc["token"].as<String>();
       Serial.println("Login successful! Acquired JWT token.");
     } else {
       Serial.println("Failed to parse login response.");
     }
   } else {
     Serial.printf("Login failed. HTTP Code: %d\n", httpResponseCode);
     Serial.println(http.getString());
   }
   http.end();
 }
}


void updateOledClock() {
 if (!oledReady) return;


 unsigned long currentMillis = millis();
 if (currentMillis - lastOledUpdate < oledUpdateInterval && lastOledUpdate != 0) return;
 lastOledUpdate = currentMillis;


 struct tm timeinfo;
 display.clearDisplay();
 display.setTextSize(1);
 display.setTextColor(SSD1306_WHITE);


 if (getLocalTime(&timeinfo)) {
   char dateText[16];
   char timeText[16];
   strftime(dateText, sizeof(dateText), "%d-%m", &timeinfo);
   strftime(timeText, sizeof(timeText), "%H:%M:%S", &timeinfo);


   display.setCursor(0, 0);
   display.print(dateText);
   display.print(" ");
   display.println(timeText);


   display.setCursor(0, 11);
   display.print("K1:");
   display.println(getOledFittedText(todayMedicationNameSlot1, 18));


   display.setCursor(0, 22);
   display.print("K2:");
   display.println(getOledFittedText(todayMedicationNameSlot2, 18));
 } else {
   display.setCursor(0, 0);
   display.println("EldCare MedBox");
   display.setCursor(0, 12);
   display.println("Waktu belum sync");
 }


 display.display();
}


String getOledFittedText(String text, int maxChars) {
 if (text.length() == 0) return "-";
 if (text.length() <= maxChars) return text;
 if (maxChars <= 3) return text.substring(0, maxChars);
 return text.substring(0, maxChars - 3) + "...";
}


void handleBuzzerReminders() {
 updateBuzzerReminder(BUZZER_PIN_1, slot1BuzzerActive, slot1BuzzerOn, slot1LastBuzzerBeep, slot1BuzzerStartedAt);
 updateBuzzerReminder(BUZZER_PIN_2, slot2BuzzerActive, slot2BuzzerOn, slot2LastBuzzerBeep, slot2BuzzerStartedAt);
}


void updateBuzzerReminder(int buzzerPin, bool &isActive, bool &isOn, unsigned long &lastBeep, unsigned long &startedAt) {
 unsigned long currentMillis = millis();
 if (!isActive) {
   if (isOn) {
     digitalWrite(buzzerPin, LOW);
     isOn = false;
   }
   return;
 }


 if (!isOn && (lastBeep == 0 || currentMillis - lastBeep >= buzzerInterval)) {
   digitalWrite(buzzerPin, HIGH);
   isOn = true;
   startedAt = currentMillis;
   lastBeep = currentMillis;
 }


 if (isOn && currentMillis - startedAt >= buzzerBeepDuration) {
   digitalWrite(buzzerPin, LOW);
   isOn = false;
 }
}


void stopBuzzerReminder(int buzzerPin, bool &isActive, bool &isOn) {
 isActive = false;
 isOn = false;
 digitalWrite(buzzerPin, LOW);
}


void printCurrentTime() {
 unsigned long currentMillis = millis();
 if (currentMillis - lastTimePrint >= timePrintInterval) {
   lastTimePrint = currentMillis;
   struct tm timeinfo;
   if (getLocalTime(&timeinfo)) {
     Serial.println(&timeinfo, "[RTC Check] Current Time: %Y-%m-%d %H:%M:%S");
   } else {
     Serial.println("[RTC Check] Failed to obtain time");
   }
 }
}


void fetchAndProcessSchedules(String currentDate, String currentTime) {
 if (WiFi.status() == WL_CONNECTED) {
   HTTPClient http;
   // Pass the secureClient here
   http.begin(secureClient, serverUrl);
   http.setTimeout(60000);
   http.addHeader("access_token", jwtToken.c_str());


   unsigned long getStartedAt = millis();
   int httpResponseCode = http.GET();
   unsigned long getLatency = millis() - getStartedAt;
   Serial.printf("[Latency] HTTP GET jadwal: %lu ms | Response code: %d\n", getLatency, httpResponseCode);

   if (httpResponseCode == 200) {
     String payload = http.getString();
     DynamicJsonDocument doc(16384);
     DeserializationError error = deserializeJson(doc, payload);


     if (!error) {
       Serial.println("Successfully fetched and parsed schedules.");
       Serial.println("--- List of Schedules in Database ---");
       todayMedicationNameSlot1 = "-";
       todayMedicationNameSlot2 = "-";
      
       for (JsonObject schedule : doc.as<JsonArray>()) {
         String date = schedule["consumptionDate"].as<String>();
         String time = schedule["consumptionTime"].as<String>();
         int slot = schedule["medBoxSlot"].as<int>();
         bool confirmationMedBox = schedule["confirmationMedBox"] | false;
         String scheduleId = schedule["_id"].as<String>();
         String medicationName = String(schedule["medicationName"] | "-");
         String medBoxId = String(schedule["MedBoxID"] | defaultMedBoxId);
        
         if (date == currentDate) {
           if (slot == 1) {
             todayMedicationNameSlot1 = medicationName;
           } else if (slot == 2) {
             todayMedicationNameSlot2 = medicationName;
           }
         }


         Serial.printf("-> ID: %s | Date: %s | Time: %s | Slot: %d | MedBox Confirmed: %s\n",
                       scheduleId.c_str(), date.c_str(), time.c_str(), slot, confirmationMedBox ? "true" : "false");
                      
         if (date == currentDate && time == currentTime && !confirmationMedBox) {
           if (slot == 1 && lastTriggeredTimeSlot1 != currentTime) {
             triggerSlot1(scheduleId, medicationName, medBoxId);
             lastTriggeredTimeSlot1 = currentTime;
           }
           else if (slot == 2 && lastTriggeredTimeSlot2 != currentTime) {
             triggerSlot2(scheduleId, medicationName, medBoxId);
             lastTriggeredTimeSlot2 = currentTime;
           }
         }
       }
       Serial.println("-------------------------------------");
     } else {
       Serial.print("deserializeJson() failed: ");
       Serial.println(error.c_str());
     }
   } else {
     Serial.printf("Error fetching schedule. HTTP Response code: %d\n", httpResponseCode);
   }
   http.end();
 } else {
   Serial.println("WiFi Disconnected. Cannot fetch schedule.");
 }
}


void triggerSlot1(String scheduleId, String medicationName, String medBoxId) {
 Serial.println("!!! MATCH FOUND: Triggering Slot 1 Servo & Buzzer Reminder !!!");
 activeScheduleIdSlot1 = scheduleId;
 activeMedicationNameSlot1 = medicationName;
 activeMedBoxIdSlot1 = medBoxId;
 slot1WaitingForMotion = true;
 slot1ClosePending = false;
 slot1MotionWaitStartedAt = millis();
 slot1MotionDetectedAt = 0;
 slot1BuzzerActive = true;
 slot1BuzzerOn = false;
 slot1LastBuzzerBeep = 0;
 slot1BuzzerStartedAt = 0;


 servo1.write(SERVO_OPEN_ANGLE);
 Serial.println("Slot 1 servo is open. Buzzer will beep every 5 seconds while waiting for medication pickup.");
 Serial.println("[PIR Speed] Slot 1 mulai menghitung waktu deteksi gerak setelah fetch data.");
}


void triggerSlot2(String scheduleId, String medicationName, String medBoxId) {
 Serial.println("!!! MATCH FOUND: Triggering Slot 2 Servo & Buzzer Reminder !!!");
 activeScheduleIdSlot2 = scheduleId;
 activeMedicationNameSlot2 = medicationName;
 activeMedBoxIdSlot2 = medBoxId;
 slot2WaitingForMotion = true;
 slot2ClosePending = false;
 slot2MotionWaitStartedAt = millis();
 slot2MotionDetectedAt = 0;
 slot2BuzzerActive = true;
 slot2BuzzerOn = false;
 slot2LastBuzzerBeep = 0;
 slot2BuzzerStartedAt = 0;


 servo2.write(SERVO_OPEN_ANGLE);
 Serial.println("Slot 2 servo is open. Buzzer will beep every 5 seconds while waiting for medication pickup.");
 Serial.println("[PIR Speed] Slot 2 mulai menghitung waktu deteksi gerak setelah fetch data.");
}


void handlePickupSlot1() {
 if (!slot1WaitingForMotion && !slot1ClosePending) {
   digitalWrite(LED_1_PIN, LOW);
   return;
 }


 int pirState = digitalRead(PIR_1_PIN);
 digitalWrite(LED_1_PIN, pirState == HIGH ? HIGH : LOW);
  if (slot1WaitingForMotion && pirState == HIGH) {
   slot1WaitingForMotion = false;
   slot1ClosePending = true;
   slot1MotionDetectedAt = millis();
   unsigned long detectionSpeed = slot1MotionWaitStartedAt == 0 ? 0 : slot1MotionDetectedAt - slot1MotionWaitStartedAt;
   stopBuzzerReminder(BUZZER_PIN_1, slot1BuzzerActive, slot1BuzzerOn);
   sendMedicationTakenNotification(activeMedBoxIdSlot1, activeMedicationNameSlot1);
   Serial.printf("[PIR Speed] Slot 1 deteksi gerak setelah fetch data: %lu ms\n", detectionSpeed);
   Serial.println("PIR 1 detected motion. Slot 1 servo will close in 1 minute.");
 }


 if (slot1ClosePending && millis() - slot1MotionDetectedAt >= pickupCloseDelay) {
   servo1.write(SERVO_CLOSED_ANGLE);
   digitalWrite(LED_1_PIN, LOW);
   slot1ClosePending = false;
   Serial.println("Slot 1 servo closed. Reporting medication pickup to backend.");
   reportMedicationTaken(activeScheduleIdSlot1);
   activeScheduleIdSlot1 = "";
   activeMedicationNameSlot1 = "";
   activeMedBoxIdSlot1 = "";
   slot1MotionWaitStartedAt = 0;
 }
}


void handlePickupSlot2() {
 if (!slot2WaitingForMotion && !slot2ClosePending) {
   digitalWrite(LED_2_PIN, LOW);
   return;
 }


 int pirState = digitalRead(PIR_2_PIN);
 digitalWrite(LED_2_PIN, pirState == HIGH ? HIGH : LOW);
  if (slot2WaitingForMotion && pirState == HIGH) {
   slot2WaitingForMotion = false;
   slot2ClosePending = true;
   slot2MotionDetectedAt = millis();
   unsigned long detectionSpeed = slot2MotionWaitStartedAt == 0 ? 0 : slot2MotionDetectedAt - slot2MotionWaitStartedAt;
   stopBuzzerReminder(BUZZER_PIN_2, slot2BuzzerActive, slot2BuzzerOn);
   sendMedicationTakenNotification(activeMedBoxIdSlot2, activeMedicationNameSlot2);
   Serial.printf("[PIR Speed] Slot 2 deteksi gerak setelah fetch data: %lu ms\n", detectionSpeed);
   Serial.println("PIR 2 detected motion. Slot 2 servo will close in 1 minute.");
 }


 if (slot2ClosePending && millis() - slot2MotionDetectedAt >= pickupCloseDelay) {
   servo2.write(SERVO_CLOSED_ANGLE);
   digitalWrite(LED_2_PIN, LOW);
   slot2ClosePending = false;
   Serial.println("Slot 2 servo closed. Reporting medication pickup to backend.");
   reportMedicationTaken(activeScheduleIdSlot2);
   activeScheduleIdSlot2 = "";
   activeMedicationNameSlot2 = "";
   activeMedBoxIdSlot2 = "";
   slot2MotionWaitStartedAt = 0;
 }
}


void sendMedicationTakenNotification(String medBoxId, String drugType) {
 if (WiFi.status() != WL_CONNECTED) {
   Serial.println("WiFi Disconnected. Cannot create notification.");
   return;
 }


 if (medBoxId.length() == 0) medBoxId = defaultMedBoxId;
 if (drugType.length() == 0) drugType = "Unknown Medicine";


 struct tm timeinfo;
 char isoTime[26];
 long notificationId = (long)(millis() % 2147483647);
 if (getLocalTime(&timeinfo)) {
   char localTimeText[20];
   strftime(localTimeText, sizeof(localTimeText), "%Y-%m-%dT%H:%M:%S", &timeinfo);
   snprintf(isoTime, sizeof(isoTime), "%s+07:00", localTimeText);
   notificationId = (long)mktime(&timeinfo);
 } else {
   snprintf(isoTime, sizeof(isoTime), "");
 }


 DynamicJsonDocument notificationDoc(512);
 notificationDoc["NotifID"] = notificationId;
 notificationDoc["MedboxID"] = medBoxId;
 notificationDoc["time"] = String(isoTime);
 notificationDoc["status"] = true;
 notificationDoc["notificationType"] = "Medicine Taking";
 notificationDoc["drugType"] = drugType;
  String requestBody;
 serializeJson(notificationDoc, requestBody);


 HTTPClient http;
 // Pass the secureClient here
 http.begin(secureClient, notificationUrl);
 http.setTimeout(15000);
 http.addHeader("access_token", jwtToken.c_str());
 http.addHeader("Content-Type", "application/json");


 int httpResponseCode = http.POST(requestBody);
 if (httpResponseCode >= 200 && httpResponseCode < 300) {
   Serial.printf("Notification created successfully for %s.\n", drugType.c_str());
 } else {
   Serial.printf("Failed to create notification. HTTP Response code: %d\n", httpResponseCode);
 }


 http.end();
}


void reportMedicationTaken(String scheduleId) {
 if (scheduleId.length() == 0) {
   Serial.println("Cannot report medication pickup: schedule ID is empty.");
   return;
 }


 if (WiFi.status() != WL_CONNECTED) {
   Serial.println("WiFi Disconnected. Cannot report medication pickup.");
   return;
 }


 HTTPClient http;
 String updateUrl = String(serverUrl) + "/" + scheduleId;
 // Pass the secureClient here
 http.begin(secureClient, updateUrl);
 http.setTimeout(15000);
 http.addHeader("access_token", jwtToken.c_str());
 http.addHeader("Content-Type", "application/json");
  String requestBody = "{\"confirmationMedBox\":true,\"confirmation\":true}";
 int httpResponseCode = http.PUT(requestBody);


 if (httpResponseCode >= 200 && httpResponseCode < 300) {
   Serial.printf("Medication pickup reported successfully for schedule %s.\n", scheduleId.c_str());
 } else {
   Serial.printf("Failed to report medication pickup. HTTP Response code: %d\n", httpResponseCode);
 }


 http.end();
}


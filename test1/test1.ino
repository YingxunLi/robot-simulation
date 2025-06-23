#include "Wire.h"
#include <MPU6050_light.h>
#include <Keyboard.h>  // Bibliothek für Tastatursimulation

MPU6050 mpu(Wire);

long timer = 0;
char keyVar = '\0';  // Variable zur Speicherung der zu simulierenden Taste

bool flipped = false; 

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Keyboard.begin();  // Initialisiert die Tastatursimulation

  // Initialisierung des MPU6050
  byte status = mpu.begin();
  Serial.print(F("MPU6050 Status: "));
  Serial.println(status);
  while (status != 0) {}  // Wenn Verbindung fehlschlägt → Stop

  Serial.println(F("Offsets werden berechnet, bitte nicht bewegen"));
  delay(1000);
  mpu.calcOffsets(true, true);  // Kalibrierung von Gyro & Beschleunigung
  Serial.println("Fertig!\n");
}

void loop() {
  // Aktualisieren der Sensordaten
  mpu.update();

  // Auslesen der Neigungswinkel in Grad
  float angleX = mpu.getAngleX();  // Vorne/Hinten
  float angleY = mpu.getAngleY();  // Links/Rechts
  float angleZ = mpu.getAngleZ();  // Drehung (Z-Achse)

  Serial.print("X");
  Serial.print(angleX);
  Serial.print(" Y");
  Serial.print(angleY);
  Serial.print(" Z");
  Serial.print(angleZ);
  Serial.print(" F");
  Serial.println(flipped);

  String motionDirection = "";
  keyVar = '\0';  // Zurücksetzen der Tasteneingabe


  bool currentlyFlipped = (abs(angleX) > 150);

  if (currentlyFlipped != flipped) {
    flipped = currentlyFlipped;
    if (flipped) {
      Serial.println("=== BOARD IS FLIPPED ===");
    } else {
      Serial.println("=== BOARD IS NORMAL ===");
    }
  }

  if (!flipped) {
    if ( angleX < -10 && angleY > 10) {
      motionDirection += "RECHTSDREHUNG ";  // Drehung nach links
      keyVar = 'E';
    } else if ( angleX < -10 && angleY < -10) {
      motionDirection += "LINKSDREHUNG "; // Drehung nach rechts
      keyVar = 'Q';
    } else if (angleX < -10) {
      motionDirection += "VORWÄRTS ";    // Bewegung nach vorne
      keyVar = 'W';
    } else if (angleX > 10) {
      motionDirection += "RÜCKWÄRTS ";   // Bewegung nach hinten
      keyVar = 'S';
    } else if (angleY < -10) {
      motionDirection += "RECHTS ";      // Neigung nach rechts
      keyVar = 'A';
    } else if (angleY > 10) {
      motionDirection += "LINKS ";       // Neigung nach links
      keyVar = 'D';
    } 
  } else {
    if (angleX < -170) {
      motionDirection += "ARM HOCH (R) ";  
      keyVar = 'R';
    } else if (angleX < 160 && angleX > 0) {
      motionDirection += "ARM RUNTER (F) ";
      keyVar = 'F';
    } else {
      keyVar = '\0';    }
  }

  // === Ausgabe & Tastendruck bei Bewegung ===
  if (motionDirection != "") {
    Serial.print("BEWEGUNG: ");
    Serial.println(motionDirection);
    Serial.print("SIMULIERTE TASTE: ");
    Serial.println(keyVar);
    Serial.println(F("-----------------------------------------------------"));

    // Simuliere Tastendruck
    Keyboard.press(keyVar);
    delay(100);  // Taste kurz halten
    Keyboard.releaseAll();  // Alle Tasten loslassen
  }
}



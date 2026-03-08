import struct
import time
import ubluetooth
from machine import Pin

# BLE UUIDs
SERVICE_UUID = ubluetooth.UUID(0xA100)
CHAR_UUID_RX = ubluetooth.UUID(0xA101)  # App escribe aqui
CHAR_UUID_TX = ubluetooth.UUID(0xA102)  # ESP32 responde aqui

# BLE events
_IRQ_CENTRAL_CONNECT = 1
_IRQ_CENTRAL_DISCONNECT = 2
_IRQ_GATTS_WRITE = 3

CURRENT_BLE = None


def _adv_payload(name, service_uuid_16):
    payload = bytearray()

    def _append(ad_type, value):
        payload.extend(struct.pack("BB", len(value) + 1, ad_type) + value)

    # LE General Discoverable + BR/EDR not supported
    _append(0x01, b"\x06")
    _append(0x09, name.encode("utf-8"))
    _append(0x03, struct.pack("<H", service_uuid_16))
    return payload


class BLEBidirectional:
    def __init__(self):
        self._ble = ubluetooth.BLE()
        self._ble.active(True)
        self._ble.irq(self._irq)
        self._connections = set()
        self._last_rx = b""

        # GPIO36 en ESP32 clasico es solo entrada; usamos GPIO2 como salida real.
        self._led_out_pin = 2
        self._led_out = Pin(self._led_out_pin, Pin.OUT)
        self._led_out.value(0)

        self._register_services()

    def _register_services(self):
        service = (
            SERVICE_UUID,
            (
                (CHAR_UUID_RX, ubluetooth.FLAG_WRITE | ubluetooth.FLAG_WRITE_NO_RESPONSE),
                (CHAR_UUID_TX, ubluetooth.FLAG_READ | ubluetooth.FLAG_NOTIFY),
            ),
        )
        ((self._handle_rx, self._handle_tx),) = self._ble.gatts_register_services((service,))
        self._ble.gatts_write(self._handle_tx, b"Hola desde ESP32")

    def _irq(self, event, data):
        if event == _IRQ_CENTRAL_CONNECT:
            conn_handle, addr_type, addr = data
            self._connections.add(conn_handle)
            addr_str = ":".join("{:02x}".format(b) for b in bytes(addr))
            print("Central conectado:", addr_str, "type", addr_type)

        elif event == _IRQ_CENTRAL_DISCONNECT:
            conn_handle, addr_type, addr = data
            if conn_handle in self._connections:
                self._connections.remove(conn_handle)
            addr_str = ":".join("{:02x}".format(b) for b in bytes(addr))
            print("Central desconectado:", addr_str, "type", addr_type)
            self._advertise()

        elif event == _IRQ_GATTS_WRITE:
            conn_handle, value_handle = data
            if value_handle == self._handle_rx:
                value = self._ble.gatts_read(self._handle_rx)
                self._last_rx = value

                try:
                    text = value.decode("utf-8", "ignore").strip()
                except Exception:
                    text = ""

                print("App escribio:", text)
                print("App escribio (raw):", value)

                if text == "LED_PIN36_ON":
                    self._set_led(True)
                    self.send_text("LED pin36 solicitado -> LED real GPIO{} encendido".format(self._led_out_pin))
                elif text == "LED_PIN36_OFF":
                    self._set_led(False)
                    self.send_text("LED pin36 solicitado -> LED real GPIO{} apagado".format(self._led_out_pin))
                else:
                    self.send_text("Recibido: " + text)

    def _set_led(self, on):
        self._led_out.value(1 if on else 0)
        print("LED GPIO{} {}".format(self._led_out_pin, "ON" if on else "OFF"))

    def _advertise(self):
        payload = _adv_payload("ESP32-Bidir", 0xA100)
        try:
            self._ble.gap_advertise(500_000, adv_data=payload, connectable=True)
            print("Advertising (bidireccional, connectable=True)")
        except TypeError:
            self._ble.gap_advertise(500_000, adv_data=payload)
            print("Advertising (modo compatibilidad)")

    def send_text(self, text):
        if isinstance(text, str):
            data = text.encode("utf-8")
        else:
            data = bytes(text)

        self._ble.gatts_write(self._handle_tx, data)
        for conn in tuple(self._connections):
            try:
                self._ble.gatts_notify(conn, self._handle_tx)
            except OSError:
                pass
        print("Mensaje enviado:", data)

    def start(self):
        self._advertise()

    def stop(self):
        self._ble.gap_advertise(None)
        print("Advertising detenido")


def send_text(text):
    if CURRENT_BLE is None:
        print("BLE no inicializado")
        return
    CURRENT_BLE.send_text(text)


def main():
    global CURRENT_BLE
    print("Iniciando BLE bidireccional...")
    CURRENT_BLE = BLEBidirectional()
    CURRENT_BLE.start()

    boton = Pin(0, Pin.IN, Pin.PULL_UP)
    last_state = boton.value()
    last_press_ms = 0

    while True:
        time.sleep_ms(50)
        state = boton.value()
        now = time.ticks_ms()

        if last_state == 1 and state == 0:
            if time.ticks_diff(now, last_press_ms) > 250:
                CURRENT_BLE.send_text("Mensaje desde boton GPIO0")
                last_press_ms = now

        last_state = state


if __name__ == "__main__":
    main()

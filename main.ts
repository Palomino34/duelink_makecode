namespace DUELink {
    let _str_response: string
    let _value_response: number
    let _timeout: number
    let _doSync = false
    //% block="Set timeout to %timeout"
    export function SetTimeout(timeout: number) {
        _timeout = timeout
    }
    //% block="Execute command %text"
    export function ExecuteCommand(str: string): number {
        led.plot(1,0)
        if (_doSync===false){
            Sync() // sync first Execute
            _doSync = true
        }

        led.plot(2, 0)
        
        pins.i2cWriteBuffer(0x52, Buffer.fromUTF8(str), false);
        let buf = pins.createBuffer(1)
        buf[0] = 10
        pins.i2cWriteBuffer(0x52, buf)
        led.plot(3, 0)
        return ReadResponse()
    }

    //% block="Read reponse"
    export function ReadResponse(): number {
        _value_response = -1
        _str_response = ""
        let timeout = _timeout

        led.plot(0, 1)
        while (_value_response != 10 && timeout > 0) {
            _value_response = pins.i2cReadNumber(0x52, NumberFormat.UInt8LE, false)
            //\r is not put added because < 32
            if (_value_response >= 32 && _value_response < 127) {
                _str_response = "" + _str_response + String.fromCharCode(_value_response)
                timeout = _timeout
            } else {
                pause(1)
                timeout--
            }
        }
        
        led.plot(1, 1)
        // we only need number like: "123\r\n>". We only need number
        // this will clear > or any garbage then
        pause(2) 
        _value_response = -1
        while (_value_response != 255) {
            _value_response = pins.i2cReadNumber(82, NumberFormat.UInt8LE, false)
            pause(1)
        }

        led.plot(2, 1)
        if (_str_response.trim() === "")

            led.plot(3, 1)
            return -1

        try {
            const ret = parseFloat(_str_response);

            if (isNaN(ret)) {
                led.plot(4, 1)
                return -1;
            }

            led.plot(0, 2)
            return ret;
        } 
        catch {
            led.plot(1, 2)
            return -1
        }

        
    }
    //% blockHidden=1
    function Sync() {
        _value_response = -1
        _str_response = ""
        _timeout = 1000

        let buf2 = pins.createBuffer(1)
        buf2[0] = 27
        pins.i2cWriteBuffer(0x52, buf2)
        pause(100)

        buf2[0] = 10
        pins.i2cWriteBuffer(0x52, buf2)
        pause(10)
        
        ReadResponse()
    }



}

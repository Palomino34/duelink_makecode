//% color="#046307" weight=10 icon="\uF44D"
namespace DUELink {
    let _str_response: string
    let _value_response: number
    let _timeout: number
    let _doSync: boolean

    //% block="Set response timeout to %timeout milliseconds"
    export function SetTimeout(timeout: number = 1000) {
        _timeout = timeout
    }
    //% block="Execute command %text return number"
    export function ExecuteCommand(str: string = "dread(1,2)"): number {
        if (!_doSync) {
            _str_response = ""
            _value_response = -1
            _timeout = 1000
            Sync() // sync first Execute
            _doSync = true
        }
               
        pins.i2cWriteBuffer(0x52, Buffer.fromUTF8(str), false);
        let buf = pins.createBuffer(1)
        buf[0] = 10
        pins.i2cWriteBuffer(0x52, buf)  

        let reponse = ReadResponse()

        if (reponse.trim() === "")
            return -1

        try {
            const ret = parseFloat(reponse);

            if (isNaN(ret)) {

                return -1;
            }

            return ret;
        }
        catch {
            return -1
        }
    }

    //% block="Execute command %text return raw string"
    export function ExecuteCommandRaw(str: string = "version()"): string {
        if (!_doSync) {
            _str_response = ""
            _value_response = -1
            _timeout = 1000
            Sync() // sync first Execute
            _doSync = true
        }

        pins.i2cWriteBuffer(0x52, Buffer.fromUTF8(str), false);
        let buf2 = pins.createBuffer(1)
        buf2[0] = 10
        pins.i2cWriteBuffer(0x52, buf2)
        return ReadResponse()
    }

    //% block="Execute command %text"
    export function ExecuteCommandNoReturn(str: string = "statled(100,100,10)"): void {
        if (!_doSync) {
            _str_response = ""
            _value_response = -1
            _timeout = 1000
            Sync() // sync first Execute
            _doSync = true
        }

        pins.i2cWriteBuffer(0x52, Buffer.fromUTF8(str), false);
        let buf2 = pins.createBuffer(1)
        buf2[0] = 10
        pins.i2cWriteBuffer(0x52, buf2)
        ReadResponse()
    }

    //% block="Read reponse"
    export function ReadResponse(): string {
        _value_response = -1
        _str_response = ""
        let timeout = _timeout
      
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
                
        // we only need number like: "123\r\n>". We only need number
        // this will clear > or any garbage then
        pause(2) 
        _value_response = -1
        while (_value_response != 255) {
            _value_response = pins.i2cReadNumber(82, NumberFormat.UInt8LE, false)
            pause(1)
        }

        return _str_response
    }
    //% blockHidden=1
    function Sync() {
        _value_response = -1
        _str_response = ""
        _timeout = 1000

        let buf22 = pins.createBuffer(1)
        buf22[0] = 27
        pins.i2cWriteBuffer(0x52, buf22)
        pause(100)

        buf22[0] = 10
        pins.i2cWriteBuffer(0x52, buf22)
        pause(10)
        
        ReadResponse()
    }
}

namespace duelink {
    let _str_response: string
    let _value_response: number
    let _timeout: number
    let _doSync: boolean

    //% block="Set timeout to %timeout"
    export function SetTimeout(timeout: number) {
        _timeout = timeout
    }
    //% block="Execute command %text"
    export function ExecuteCommand(str: string): number {
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
        return ReadResponse()
    }

    //% block="Read reponse"
    export function ReadResponse(): number {
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

        
        if (_str_response.trim() === "")

            
            return -1

        try {
            const ret = parseFloat(_str_response);

            if (isNaN(ret)) {
                
                return -1;
            }

            
            return ret;
        } 
        catch {
            
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

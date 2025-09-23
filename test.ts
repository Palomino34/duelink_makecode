// tests go here; this will not be compiled when this package is used as an extension.

while (true) {
    if (DUELink.ExecuteCommand("dread(1,2)")==1)
        led.plot(2, 2)
    else {
        led.unplot(2, 2)
        console.log(DUELink.ExecuteCommandRaw("readvcc()"))
    }

    pause(100)
}



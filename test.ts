// tests go here; this will not be compiled when this package is used as an extension.

while (true) {
    if (duelink.ExecuteCommand("dread(1,2)")==1)
        led.plot(2, 2)
    else 
        led.unplot(2, 2)

    pause(100)

    
}



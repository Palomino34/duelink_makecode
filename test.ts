// tests go here; this will not be compiled when this package is used as an extension.
led.plot(0, 0)
DUELink.ExecuteCommand("statled(100,100,10)")
led.plot(0, 4)

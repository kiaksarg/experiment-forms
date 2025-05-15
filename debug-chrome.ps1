# Adjust path if Chrome is installed elsewhere
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

Start-Process -FilePath $chromePath `
  -ArgumentList @(
    "--remote-debugging-port=9222",
    "--user-data-dir=C:\chrome-debug",
    "http://localhost:3000"
  )

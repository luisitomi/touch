# CoWorkSpacesSolution - Manual de Concurrencia y Stress Test

Este módulo contiene la implementación y las directrices para la validación atómica de reservas concurrentes bajo el estándar de Touch Consulting.

## 🗄️ 1. Inicialización de la Base de Datos

El script completo para construir el esquema, las restricciones lógicas, los índices, la data semilla obligatoria y los procedimientos almacenados dinámicos se encuentra estructurado en la solución en la siguiente ruta:

Ruta del archivo: Database/script_inicial.sql

Se debe ejecutar dicho script íntegramente en su cliente SQL de preferencia (DBeaver / SSMS) para restaurar el entorno limpio antes de iniciar las pruebas de carga.

## 🧪 2. Validación de Simultaneidad (PowerShell)

Para simular una ráfaga de tráfico concurrente real en el mismo milisegundo sin depender de herramientas pesadas de terceros, se diseñó este script compatible con PowerShell 5.1+. El script utiliza trabajos asíncronos en segundo plano (Start-Job) y omite el análisis básico de Internet Explorer para ejecutarse de manera directa.

### Instrucciones de Uso:
1. Asegúrese de que la API de .NET esté levantada y escuchando en https://localhost:44321/
2. Copie, pegue y ejecute la siguiente línea de comandos consolidada en su consola de PowerShell:

[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; $b = '{"espacioId":1,"fecha":"2026-07-28","horaInicio":"10:00","horaFin":"12:00"}'; $u = "https://localhost:44321/api/reservas"; $sb = { param($url, $body) try { $r = Invoke-WebRequest -Uri $url -Method Post -Body $body -ContentType "application/json" -UseBasicParsing; return 201 } catch { if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode } else { return 500 } } }; $j1 = Start-Job -ScriptBlock $sb -ArgumentList $u, $b; $j2 = Start-Job -ScriptBlock $sb -ArgumentList $u, $b; Clear-Host; Write-Host "======================================================================" -ForegroundColor Cyan; Write-Host "   TOUCH CONSULTING - PRUEBA DE ESTRÉS Y CONCURRENCIA SIMULTÁNEA" -ForegroundColor Cyan; Write-Host "======================================================================" -ForegroundColor Cyan; Write-Host "Enviando solicitudes en paralelo al mismo milisegundo..." -ForegroundColor DarkGray; $res1 = Receive-Job -Job $j1 -Wait; $res2 = Receive-Job -Job $j2 -Wait; $c1 = if($res1 -eq 201){"Green"}elseif($res1 -eq 409){"Red"}else{"Yellow"}; $c2 = if($res2 -eq 201){"Green"}elseif($res2 -eq 409){"Red"}else{"Yellow"}; Write-Host "`n[PETICIÓN A INTERCEPTADA]" -ForegroundColor Yellow; Write-Host "Código de Estado HTTP: " -NoNewline; Write-Host $res1 -ForegroundColor $c1; if($res1 -eq 409){ Write-Host "Detalle: Conflicto de concurrencia mitigado por SERIALIZABLE + UPDLOCK." -ForegroundColor Red }elseif($res1 -ne 201){ Write-Host "Alerta: El servidor respondió con un estado inesperado de la capa lógica." -ForegroundColor Yellow }; Write-Host "[PETICIÓN B INTERCEPTADA]" -ForegroundColor Yellow; Write-Host "Código de Estado HTTP: " -NoNewline; Write-Host $res2 -ForegroundColor $c2; if($res2 -eq 409){ Write-Host "Detalle: Conflicto de concurrencia mitigado por SERIALIZABLE + UPDLOCK." -ForegroundColor Red }elseif($res2 -ne 201){ Write-Host "Alerta: El servidor respondió con un estado inesperado de la capa lógica." -ForegroundColor Yellow }; Write-Host "======================================================================" -ForegroundColor Cyan; Remove-Job *

### Resultado Esperado en Consola:
El sistema responderá bajo el estándar arquitectónico REST, serializando las peticiones en fila india gracias al candado maestro sobre la tabla física de espacios:
- Petición A Interceptada: Código de Estado HTTP: 201 (Éxito, registro persistido).
- Petición B Interceptada: Código de Estado HTTP: 409 (Conflicto lícito de concurrencia, transacción revertida por el motor).
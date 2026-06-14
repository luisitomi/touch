```markdown
# README - CoWorkSpacesSolution

Este módulo contiene la suite completa para la gestión de reservas, motor de tarifas dinámicas y políticas de cancelación bajo el estándar de Touch Consulting.

---

## 🚀 1. Instrucciones de Instalación y Ejecución

### Requisitos Previos
* **.NET SDK 10.0**
* **SQL Server 2019** o superior
* **NodeJS 20+**

### 🗄️ Paso A: Base de Datos
1. Abra su cliente SQL de preferencia (SSMS / DBeaver).
2. Ejecute íntegramente el script ubicado en la ruta `Database/script_inicial.sql` para restaurar tablas, estados semilla y procedimientos almacenados.

### ⚙️ Paso B: Backend (.NET)
1. Desde la raíz de la solución, restaure las dependencias y compile el proyecto:
   ```bash
   dotnet restore
   dotnet build

```

2. Inicie la API Web:
```bash
dotnet run --project Solution.API/Solution.API.csproj

```


> 🌐 **Nota:** La API quedará escuchando de forma activa en: `https://localhost:44321/`



### 💻 Paso C: Frontend (Angular)

1. Navegue a la carpeta del cliente:
```bash
cd CoWorkSpacesFront

```


2. Instale los paquetes locales de node e inicie el servidor de desarrollo:
```bash
npm install
npm start

```



---

## 📐 2. Decisiones de Arquitectura y Trade-offs

### Arquitectura Limpia (Clean Architecture)

Se organizó la solución dividiendo las responsabilidades en capas desacopladas para garantizar el mantenimiento a largo plazo:

* **`Solution.Core`:** Contiene las entidades, interfaces y DTOs de negocio sin dependencias externas de frameworks.
* **`Solution.Infrastructure`:** Implementa el acceso a datos mediante Dapper y centraliza las transacciones usando el patrón *Unit of Work*.
* **`Solution.API`:** Expone los endpoints REST encargados de recibir y validar las peticiones del cliente.

### Trade-offs (Compromisos de Diseño)

* **Lógica en Base de Datos vs. Capa de Aplicación:** Se delegó el cálculo complejo de tarifas dinámicas y el cruce exacto de horarios a Stored Procedures.
* *Trade-off:* Se pierde portabilidad directa entre distintos motores SQL, pero se gana una velocidad de procesamiento masiva al evitar la latencia de red (*Round-Trips*) que implicaría traer registros históricos hacia la memoria de .NET.


* **Dapper vs. Entity Framework Core:** Se eligió Dapper por su rendimiento bruto y ligereza en lecturas masivas y ejecuciones directas.
* *Trade-off:* Se prescinde de la abstracción automatizada de un ORM completo, requiriendo el mapeo explícito de parámetros a través de `DynamicParameters`.



---

## 🔒 3. Justificación de la Estrategia de Concurrencia

Para evitar el problema clásico de la **Doble Reserva** (dos usuarios adquiriendo el mismo espacio dentro del mismo bloque horario), se descartó el bloqueo optimista tradicional. En su lugar, se optó por un enfoque de **Bloqueo Pesimista Estricto** integrado en la base de datos mediante niveles de aislamiento avanzados.

### Justificación Técnico-Práctica

El Stored Procedure implementa el nivel de aislamiento `SERIALIZABLE` en combinación con la sugerencia de bloqueo `UPDLOCK` sobre las consultas de validación horaria.

Cuando ingresan dos transacciones simultáneas:

1. **Petición 1:** Lee el rango de horarios y coloca un candado de actualización (`UPDLOCK`) que se mantiene activo hasta que termine toda su transacción.
2. **Petición 2:** Al intentar leer el mismo espacio, es forzada a esperar en hilera ("fila india").
3. **Resolución:** Una vez insertada la primera reserva, la segunda despierta, detecta el cruce inmediato y aborta de forma segura mediante un `RAISERROR('CONFLICT_409')`. Esto garantiza consistencia absoluta de datos a nivel ACID.

---

## 📊 4. Orden de Aplicación de las Reglas de Tarifas

El motor de tarifas dinámicas evalúa e integra los factores de costo de manera lineal y acumulativa sobre la **Tarifa Base por Hora** para evitar saltos bruscos en el precio final. Las reglas se aplican estrictamente en el siguiente orden secuencial:

| Orden | Regla de Negocio | Condición de Activación | Impacto Económico |
| --- | --- | --- | --- |
| **1** | **Fin de Semana** | Sábado o Domingo | **+15%** |
| **2** | **Larga Duración** | Duración de la reserva $\ge$ 4 horas | **-10%** *(Descuento)* |
| **3** | **Anticipación** | Creación de reserva $\ge$ 7 días previos | **-5%** *(Descuento)* |
| **4** | **Hora Pico** | Minutos cruzados en rangos 09-11h o 17-19h | **+25%** *(Solo tramo afectado)* |

### Fórmula de Consolidación

$$PrecioFinal = (TarifaBase \times FactorAcumulado \times HorasNormales) + (TarifaBase \times (FactorAcumulado + 0.25) \times HorasPico)$$

---

## 🧪 5. Validación de Simultaneidad (PowerShell)

Para simular una ráfaga de tráfico concurrente real en el mismo milisegundo sin depender de herramientas pesadas de terceros, se diseñó este script compatible con PowerShell 5.1+. Utiliza trabajos asíncronos en segundo plano (`Start-Job`) y omite el análisis básico de Internet Explorer para agilizar la ejecución.

### Instrucciones de Uso

1. Asegúrese de que la API de .NET esté levantada y escuchando de forma correcta.
2. Copie, pegue y ejecute la siguiente línea de comandos consolidada en su consola de PowerShell:

```powershell
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; $b = '{"espacioId":1,"fecha":"2026-07-28","horaInicio":"10:00","horaFin":"12:00"}'; $u = "https://localhost:44321/api/reservas"; $sb = { param($url, $body) try { $r = Invoke-WebRequest -Uri $url -Method Post -Body $body -ContentType "application/json" -UseBasicParsing; return 201 } catch { if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode } else { return 500 } } }; $j1 = Start-Job -ScriptBlock $sb -ArgumentList $u, $b; $j2 = Start-Job -ScriptBlock $sb -ArgumentList $u, $b; Clear-Host; Write-Host "======================================================================" -ForegroundColor Cyan; Write-Host "    TOUCH CONSULTING - PRUEBA DE ESTRÉS Y CONCURRENCIA SIMULTÁNEA" -ForegroundColor Cyan; Write-Host "======================================================================" -ForegroundColor Cyan; Write-Host "Enviando solicitudes en paralelo al mismo milisegundo..." -ForegroundColor DarkGray; $res1 = Receive-Job -Job $j1 -Wait; $res2 = Receive-Job -Job $j2 -Wait; $c1 = if($res1 -eq 201){"Green"}elseif($res1 -eq 409){"Red"}else{"Yellow"}; $c2 = if($res2 -eq 201){"Green"}elseif($res2 -eq 409){"Red"}else{"Yellow"}; Write-Host "`n[PETICIÓN A INTERCEPTADA]" -ForegroundColor Yellow; Write-Host "Código de Estado HTTP: " -NoNewline; Write-Host $res1 -ForegroundColor $c1; if($res1 -eq 409){ Write-Host "Detalle: Conflicto de concurrencia mitigado por SERIALIZABLE + UPDLOCK." -ForegroundColor Red }elseif($res1 -ne 201){ Write-Host "Alerta: El servidor respondió con un estado inesperado de la capa lógica." -ForegroundColor Yellow }; Write-Host "[PETICIÓN B INTERCEPTADA]" -ForegroundColor Yellow; Write-Host "Código de Estado HTTP: " -NoNewline; Write-Host $res2 -ForegroundColor $c2; if($res2 -eq 409){ Write-Host "Detalle: Conflicto de concurrencia mitigado por SERIALIZABLE + UPDLOCK." -ForegroundColor Red }elseif($res2 -ne 201){ Write-Host "Alerta: El servidor respondió con un estado inesperado de la capa lógica." -ForegroundColor Yellow }; Write-Host "======================================================================" -ForegroundColor Cyan; Remove-Job *

```

### Resultado Esperado en Consola

El sistema responderá bajo el estándar arquitectónico REST, serializando las peticiones y arrojando los siguientes códigos:

* **Petición A Interceptada:** Código de Estado HTTP: `201` *(Éxito, registro persistido correctamente)*.
* **Petición B Interceptada:** Código de Estado HTTP: `409` *(Conflicto lícito de concurrencia, transacción revertida por el motor SQL)*.

---

## 💻 6. Cómo Ejecutar los Tests Unitarios

La solución cuenta con una suite automatizada de **8 pruebas críticas** alojadas en el proyecto `Solution.Tests`, utilizando **xUnit** y **Moq** para blindar los cálculos de tarifas y las reglas de políticas de cancelación de 48 horas.

### 🛠️ Opción A: Desde la Consola de Comandos (CLI)

1. Ubíquese en la carpeta raíz de la solución.
2. Ejecute el comando global de pruebas:
```bash
dotnet test

```


3. La terminal arrojará de forma inmediata el desglose de los métodos ejecutados junto con la confirmación de éxito.

### 🔌 Opción B: Desde el Explorador de Visual Studio

1. En el menú superior de Visual Studio, seleccione **Prueba** -> **Explorador de pruebas**.
2. Verá listados los 8 casos organizados bajo el componente `ReservasPoliticasTests`.
3. Haga clic en el botón **Ejecutar** (icono de Play verde) situado en la parte superior izquierda del panel para iniciar la validación automatizada.

```

```

-- ==========================================================================================
-- 1. CREACIÓN Y USO DE LA BASE DE DATOS (Solo aquí va el nombre)
-- ==========================================================================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CoWorkSpacesSolution1')
BEGIN
    CREATE DATABASE CoWorkSpacesSolution1;
END;

USE CoWorkSpacesSolution1;

-- ==========================================================================================
-- 2. CREACIÓN DE ESQUEMAS
-- ==========================================================================================
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'config')
BEGIN
    EXEC('CREATE SCHEMA config');
END;

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'negocio')
BEGIN
    EXEC('CREATE SCHEMA negocio');
END;

-- ==========================================================================================
-- 3. CREACIÓN DE TABLAS MAESTRAS (Esquema Puro)
-- ==========================================================================================
CREATE TABLE config.TarifasDinamicas (
	TarifaDinamicaId int IDENTITY(1,1) NOT NULL,
	CodigoRegla varchar(30) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Factor decimal(5,2) NOT NULL,
	Descripcion varchar(150) COLLATE Modern_Spanish_CI_AS NULL,
	EsActivo bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_TarifasDinamicas PRIMARY KEY CLUSTERED (TarifaDinamicaId),
	CONSTRAINT UQ_TarifasDinamicas_Codigo UNIQUE NONCLUSTERED (CodigoRegla)
);

CREATE TABLE negocio.Estados (
	EstadoId int IDENTITY(1,1) NOT NULL,
	TipoEstado varchar(30) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Codigo varchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Descripcion varchar(50) COLLATE Modern_Spanish_CI_AS NOT NULL,
	EsActivo bit DEFAULT 1 NOT NULL,
	FechaCreacion datetime DEFAULT getutcdate() NOT NULL,
	CONSTRAINT PK_Estados PRIMARY KEY CLUSTERED (EstadoId),
	CONSTRAINT UQ_Estados_Codigo UNIQUE NONCLUSTERED (Codigo)
);

-- ==========================================================================================
-- 4. CREACIÓN DE TABLAS DEPENDIENTES
-- ==========================================================================================
CREATE TABLE negocio.EspaciosCoworking (
	EspacioId int IDENTITY(1,1) NOT NULL,
	Nombre varchar(100) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CapacidadPersonas int NOT NULL,
	TarifaBaseHora decimal(18,2) NOT NULL,
	HorarioApertura time NOT NULL,
	HorarioCierre time NOT NULL,
	EstadoId int NOT NULL,
	FechaCreacion datetime DEFAULT getutcdate() NOT NULL,
	CONSTRAINT PK_EspaciosCoworking PRIMARY KEY CLUSTERED (EspacioId),
	CONSTRAINT FK_EspaciosCoworking_Estados FOREIGN KEY (EstadoId) REFERENCES negocio.Estados(EstadoId)
);

CREATE TABLE negocio.Reservas (
	ReservaId int IDENTITY(1,1) NOT NULL,
	EspacioId int NOT NULL,
	FechaReserva date NOT NULL,
	HoraInicio time NOT NULL,
	HoraFin time NOT NULL,
	PrecioTotalCalculado decimal(18,2) NOT NULL,
	EstadoId int NOT NULL,
	CodigoUnicoUuid uniqueidentifier DEFAULT newid() NOT NULL,
	CONSTRAINT PK_Reservas PRIMARY KEY CLUSTERED (ReservaId),
	CONSTRAINT UQ_Reservas_CodigoUnico UNIQUE NONCLUSTERED (CodigoUnicoUuid),
	CONSTRAINT FK_Reservas_EspaciosCoworking FOREIGN KEY (EspacioId) REFERENCES negocio.EspaciosCoworking(EspacioId),
	CONSTRAINT FK_Reservas_Estados FOREIGN KEY (EstadoId) REFERENCES negocio.Estados(EstadoId)
);

-- ==========================================================================================
-- 5. CREACIÓN DEL ÍNDICE ÚNICO FILTRADO DE DISPONIBILIDAD
-- ==========================================================================================
CREATE UNIQUE NONCLUSTERED INDEX UX_Reservas_NoSolapamiento 
ON negocio.Reservas (EspacioId ASC, FechaReserva ASC, HoraInicio ASC)
WHERE ([EstadoId]<>(5));

-- ==========================================================================================
-- 6. POBLADO DE DATOS INICIALES (SEED DATA)
-- ==========================================================================================
SET IDENTITY_INSERT negocio.Estados ON;
INSERT INTO negocio.Estados (EstadoId, TipoEstado, Codigo, Descripcion, EsActivo, FechaCreacion) VALUES 
(1, 'ESPACIO', 'ACT', 'Activo', 1, '2026-06-13 17:08:07.520'),
(2, 'ESPACIO', 'MANT', 'En Mantenimiento', 1, '2026-06-13 17:08:07.520'),
(3, 'ESPACIO', 'BAJA', 'Dado de Baja', 0, '2026-06-13 17:08:07.520'),
(4, 'RESERVA', 'CONF', 'Confirmada', 1, '2026-06-13 17:08:07.520'),
(5, 'RESERVA', 'CANC', 'Cancelada', 1, '2026-06-13 17:08:07.520'),
(6, 'RESERVA', 'PNDP', 'Pendiente', 1, '2026-06-13 17:08:07.520'),
(7, 'RESERVA', 'COMP', 'Completada', 1, '2026-06-13 17:08:07.520');
SET IDENTITY_INSERT negocio.Estados OFF;

SET IDENTITY_INSERT config.TarifasDinamicas ON;
INSERT INTO config.TarifasDinamicas (TarifaDinamicaId, CodigoRegla, Factor, Descripcion, EsActivo) VALUES
(1, 'FIN_DE_SEMANA', 1.15, 'Recargo del 15% por ser Sábado o Domingo', 1),
(2, 'HORA_PICO', 1.20, 'Recargo del 20% por reservar en la hora más vendida históricamente', 1),
(3, 'ANTICIPACION_7D', 0.90, 'Descuento del 10% por reservar con más de 7 días de anticipación', 1),
(4, 'LARGA_DURACION', 0.95, 'Descuento del 5% por más de 4 horas (exclusivo si no aplican las anteriores)', 1);
SET IDENTITY_INSERT config.TarifasDinamicas OFF;

SET IDENTITY_INSERT negocio.EspaciosCoworking ON;
INSERT INTO negocio.EspaciosCoworking (EspacioId, Nombre, CapacidadPersonas, TarifaBaseHora, HorarioApertura, HorarioCierre, EstadoId, FechaCreacion) VALUES 
(1, 'Sala de Reuniones Ejecutiva Premium', 10, 50.00, '08:00:00', '23:59:59', 1, '2026-06-13 17:08:07.520'),
(2, 'Escritorio Hot Desk Individual A', 1, 15.00, '08:00:00', '22:00:00', 1, '2026-06-13 17:08:07.520'),
(3, 'Oficina Privada para Equipos TI', 6, 80.00, '18:00:00', '22:00:00', 1, '2026-06-13 17:08:07.520');
SET IDENTITY_INSERT negocio.EspaciosCoworking OFF;
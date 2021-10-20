CREATE TABLE public.bancosolar (
	id serial4 NOT NULL,
	nombre varchar(50) NULL,
	balance float4 NULL,
	CONSTRAINT bancosolar_pk PRIMARY KEY (id)
);
ALTER TABLE public.bancosolar RENAME TO usuarios;

CREATE TABLE public.transferencias (
	id serial4 NOT NULL,
	emisor int4 NULL,
	receptor int4 NULL,
	monto float4 NULL,
	fecha timestamp NULL,
	CONSTRAINT transferencias_pk PRIMARY KEY (id),
	CONSTRAINT transferencias_fk FOREIGN KEY (emisor) REFERENCES public.usuarios(id),
	CONSTRAINT transferencias_fk_1 FOREIGN KEY (receptor) REFERENCES public.usuarios(id)
);

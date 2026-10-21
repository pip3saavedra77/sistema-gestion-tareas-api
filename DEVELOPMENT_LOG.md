# Bitácora de desarrollo

**Proyecto:** Sistema de Gestión de Tareas (Node.js + Express + TypeScript + PostgreSQL)
**Inicio:** 20 de octubre de 2026

## Herramientas de IA utilizadas

- **Claude (Anthropic):** planificación, explicación del enunciado y de los conceptos,
  generación de los prompts y auditoría de los cambios.
- **Antigravity (Google):** generación del código a partir de los prompts.

Los commits los hago yo, después de revisar el diff de cada cambio.

## Entrada 0: Planificación con Claude

- **Qué hice:** analicé el enunciado con Claude, confirmé que es solo backend, definí
  PostgreSQL con Docker solo para la base de datos y organicé el trabajo por tareas pequeñas.
- **Decisiones que tomé:**
  - Elegí usar Docker para la base de datos porque es una herramienta con la que me siento
    cómodo y seguro. Además, permite que quien evalúe el proyecto levante la misma versión
    de PostgreSQL con un solo comando, sin instalar nada más.
  - Elegí el nombre del repositorio, `sistema-gestion-tareas-api`, para que coincida con
    el título del enunciado y aclare que es una API.

## Entradas de uso de IA


## Decisiones sin asistencia de IA

1. **Usar Docker solo para la base de datos.** La propuse yo antes de consultarlo con
   Claude. Razón: me da un entorno reproducible. La API sigue ejecutándose con
   `npm run dev`, como pide el enunciado, y dejo en el README una alternativa con
   PostgreSQL local.
2. **Nombre del repositorio.** (Explicado en la Entrada 0.)

## Retos y soluciones


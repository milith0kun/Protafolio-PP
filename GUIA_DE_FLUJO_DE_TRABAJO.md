# Guía de Flujo de Trabajo en Git

## 1. Iniciar una Nueva Característica

### Crear y cambiar a una nueva rama
```bash
git checkout -b feature/nombre-de-la-caracteristica
```

## 2. Trabajar en la Característica

### Ver cambios pendientes
```bash
git status
```

### Agregar cambios al área de preparación
```bash
# Agregar archivos específicos
git add ruta/al/archivo

# Agregar todos los cambios
git add .
```

### Hacer commit de los cambios
```bash
git commit -m "Tipo: Descripción clara y concisa"
```

**Ejemplos de mensajes de commit:**
- `feat: Agrega autenticación de usuario`
- `fix: Corrige error en el cálculo de promedios`
- `docs: Actualiza documentación de la API`

## 3. Sincronizar con la Rama Principal

### Traer cambios de la rama main
```bash
git fetch origin
git merge origin/main
```

## 4. Subir Cambios al Repositorio Remoto

### Subir rama por primera vez
```bash
git push -u origin nombre-de-la-rama
```

### Subir cambios posteriores
```bash
git push
```

## 5. Finalizar una Característica

### Crear Pull Request (PR)
1. Ve a GitHub en tu navegador
2. Haz clic en "New Pull Request"
3. Selecciona `main` como base y tu rama para comparar
4. Revisa los cambios
5. Haz clic en "Create Pull Request"
6. Espera la revisión y aprobación

### Después de la Aprobación
1. Haz merge del PR en GitHub
2. Actualiza tu repositorio local:
   ```bash
   git checkout main
   git pull origin main
   git branch -d nombre-de-la-rama
   ```

## 6. Resolver Conflictos

Si hay conflictos al hacer merge:
1. Abre los archivos con conflictos
2. Busca los marcadores `<<<<<<<`, `=======`, `>>>>>>>`
3. Resuelve los conflictos manualmente
4. Guarda los archivos
5. Haz commit de la resolución:
   ```bash
   git add .
   git commit -m "Resuelve conflictos de merge"
   ```

## 7. Buenas Prácticas

- Haz commits pequeños y atómicos
- Escribe mensajes de commit claros y descriptivos
- Nunca trabajes directamente en la rama `main`
- Mantén tu rama actualizada con `main`
- Revisa los cambios antes de hacer commit (`git diff`)
- Usa ramas descriptivas (ej: `feature/login`, `fix/navbar`)

## 8. Comandos Útiles

### Ver historial de commits
```bash
git log --oneline --graph --all
```

### Ver cambios en archivos
```bash
git diff
```

### Deshacer cambios locales
```bash
# Descartar cambios en un archivo
git checkout -- archivo

# Descartar todos los cambios locales
git checkout -- .
```

### Trabajar con ramas
```bash
# Listar ramas locales
git branch

# Listar ramas remotas
git branch -r

# Eliminar rama local
git branch -d nombre-rama

# Forzar eliminación de rama (si tiene cambios no fusionados)
git branch -D nombre-rama
```










Algunso cosas 



# 1. Actualiza tu rama con los últimos cambios de main
git fetch origin
git merge origin/main

# 2. Crea una rama para tu tarea
git checkout -b feature/nombre-de-tu-tarea

# 3. Realiza tus cambios y haz commits
git add .
git commit -m "tipo: descripción clara"

# 4. Sube tus cambios
git push -u origin feature/nombre-de-tu-tarea
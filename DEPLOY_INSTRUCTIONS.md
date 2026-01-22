# Instrucciones de Despliegue (Deployment)

Para que tu aplicación funcione en producción (cuando la subes a internet), necesitas configurar estas **Variables de Entorno**.

Esto se hace normalmente en el panel de control de tu hosting (Vercel, Netlify, Hostinger Cloud, etc.), en una sección llamada "Settings" -> "Environment Variables".

## Variables a Configurar

### 1. Base de Datos
**Nombre (Key):** `DATABASE_URL`
**Valor (Value):** `mysql://u571171513_admi_santosapp:5z%3FNMf6LMS5@srv1316.hstgr.io:3306/u571171513_bbdd_santosapp`

### 2. Inteligencia Artificial (OpenAI)
**Nombre (Key):** `OPENAI_API_KEY`
**Valor (Value):** `sk-proj-...` (La clave larga que me pasaste en el chat, empieza por sk-proj)

---

## ¿Dónde ponerlas?

### Opción A: Vercel
1. Ve a tu proyecto en el dashboard de Vercel.
2. Clic en **Settings** > **Environment Variables**.
3. Añade cada variable una por una.
4. Dale a **Save**.
5. **Importante:** Ve a **Deployments** y dale a "Redeploy" en el último commit para que coja los cambios.

### Opción B: Hostinger (VPS / Node.js)
1. Si usas panel (ej: CyberPanel, hPanel): Busca la sección de **Variables de Entorno** o **Environment**.
2. Si lo subes por FTP/SSH: Crea un archivo llamado `.env` en la carpeta raíz del servidor y asegúrate de que tenga ambas líneas.

# Instrucciones de Despliegue (Deployment)

Para que tu aplicación funcione en producción (cuando la subes a internet), necesitas configurar esta **Variable de Entorno**.

Esto se hace normalmente en el panel de control de tu hosting (Vercel, Netlify, Hostinger Cloud, etc.), en una sección llamada "Settings" -> "Environment Variables".

## Variable a Configurar

**Nombre (Key):**
`DATABASE_URL`

**Valor (Value):**
`mysql://u571171513_admi_santosapp:5z%3FNMf6LMS5@srv1316.hstgr.io:3306/u571171513_bbdd_santosapp`

---

## ¿Dónde ponerla?

### Opción A: Vercel
1. Ve a tu proyecto en el dashboard de Vercel.
2. Clic en **Settings** > **Environment Variables**.
3. Pega `DATABASE_URL` en el nombre y la dirección larga en el valor.
4. Dale a **Save**.
5. Ve a **Deployments** y dale a "Redeploy" en el último commit para que coja el cambio.

### Opción B: Hostinger (VPS / Node.js)
1. Si usas panel (ej: CyberPanel, hPanel): Busca la sección de **Variables de Entorno** o **Environment**.
2. Si lo subes por FTP/SSH: Crea un archivo llamado `.env` en la carpeta raíz del servidor y pega el contenido del archivo `.env` que tienes en local.

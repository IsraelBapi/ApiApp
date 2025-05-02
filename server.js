const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT;


app.use(cors());
app.use(express.json());

const inventoryData = {};  
let solicitudContador = 1;


app.post('/update', (req, res) => {
    const { sku, inventory } = req.body;
    if (!sku || inventory === undefined) return res.status(400).json({ error: 'Faltan datos' });
    inventoryData[sku] = inventory;
    res.json({ message: 'Inventario actualizado' });
});



app.post('/ejecutar-rpa', async (req, res) => {
    const { sku } = req.body;

    try {

    const authResp = await axios.post('https://zapata.my.automationanywhere.digital/v2/authentication', {

    });

    const token = authResp.data.token;

    const payload = {
        fileId: 457339,
        automationPriority: "PRIORITY_HIGH",
        runAsUserIds: [297],
        overrideDefaultDevice: false,
        botInput: {
            insSKU: {
            type: "STRING",
            string: sku
            },
            insNumSolicitud: {
            type: "STRING",
            string: `#${solicitudContador++}`
            }
        }
    };

    const executeResp = await axios.post(
        'https://zapata.my.automationanywhere.digital/v3/automations/deploy',
        payload,
        {
            headers: {
            'X-Authorization': `${token}`,
            'Content-Type': 'application/json'
            }
        }
    );

    res.json({ status: 'Bot ejecutado', data: executeResp.data });

    } catch (err) {
    console.error('Error al ejecutar bot:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error al ejecutar el bot', detail: err.message });
    }
});

// Ruta para consultar el inventario
app.get('/inventory/:sku', (req, res) => {
    const sku = req.params.sku;
    const inventory = inventoryData[sku];
    if (inventory === undefined) return res.status(404).json({ error: 'SKU no encontrado' });
    res.json({ sku, inventory });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


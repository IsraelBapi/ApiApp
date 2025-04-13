const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'yamanote.proxy.rlwy.net',
    user: 'root',
    password: 'yWztzoIWoEBknblOiCcBcMXkDOvSqThG',
    database: 'railway',
    port: 35953
});


db.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.stack);
        return;
    }
    console.log('Conexión a la base de datos MySQL establecida');
});

const cors = require('cors');
app.use(cors());
app.use(express.json());

// Ruta para obtener todos los coches
app.get('/api/cars', (req, res) => {
    db.query('SELECT * FROM cars', (err, results) => {
        if (err) {
        return res.status(500).json({ error: 'Error al obtener los coches' });
        }
        res.json(results);
    });
});

// Ruta para actualizar un coche existente por su ID
app.put('/api/cars/:id', (req, res) => {
    const carId = req.params.id;
    const { make, model, year, price, image_url } = req.body;

    const query = 'UPDATE cars SET make = ?, model = ?, year = ?, price = ?, image_url = ? WHERE car_id = ?';

    db.query(query, [make, model, year, price, image_url, carId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar el coche' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Coche no encontrado' });
        }
        res.json({ message: 'Coche actualizado con éxito' });
    });
});

// Ruta para eliminar un coche por su ID
app.delete('/api/cars/:id', (req, res) => {
    const carId = req.params.id;

    db.query('DELETE FROM cars WHERE car_id = ?', [carId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar el coche' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Coche no encontrado' });
        }
        res.json({ message: 'Coche eliminado con éxito' });
    });
});



// Ruta para obtener un coche específico por su ID
app.get('/api/cars/:id', (req, res) => {
    const carId = req.params.id;
    db.query('SELECT * FROM cars WHERE car_id = ?', [carId], (err, results) => {
        if (err) {
        return res.status(500).json({ error: 'Error al obtener el coche' });
        }
        if (results.length === 0) {
        return res.status(404).json({ message: 'Coche no encontrado' });
        }
        res.json(results[0]);
    });
});

// Ruta para agregar un nuevo coche
app.post('/api/cars', (req, res) => {
    const { make, model, year, price, image_url } = req.body;
    const query = 'INSERT INTO cars (make, model, year, price, image_url) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [make, model, year, price, image_url], (err, results) => {
        if (err) {
        return res.status(500).json({ error: 'Error al agregar el coche' });
        }
        res.status(201).json({ message: 'Coche agregado con éxito', car_id: results.insertId });
    });
});



// Ruta para obtener todos los clientes
app.get('/api/clients', (req, res) => {
    db.query('SELECT * FROM clients', (err, results) => {
        if (err) {
        return res.status(500).json({ error: 'Error al obtener los clientes' });
        }
        res.json(results);
    });
});

// Ruta para obtener todos los clientes de un usuario por id
app.get('/api/clientsUser/:userId', (req, res) => {
    const userId = req.params.userId
    db.query('SELECT * FROM clients WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
        return res.status(500).json({ error: 'Error al obtener los clientes' });
        }
        res.json(results);
    });
});


// Ruta para obtener un cliente específico por su ID
app.get('/api/clients/:id', (req, res) => {
    const clientId = req.params.id;
    db.query('SELECT * FROM clients WHERE client_id = ?', [clientId], (err, results) => {
        if (err) {
        return res.status(500).json({ error: 'Error al obtener el cliente' });
        }
        if (results.length === 0) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(results[0]);
    });
});

// Ruta para registrar un cliente 
app.post('/api/clients', (req, res) => {
    console.log("Solicitud recibida:", req.body); 

    const { first_name, last_name, email, phone, birth_date, address, rfc, interested_product, user_id } = req.body;

    // Verificar que todos los campos necesarios estén presentes
    if (!first_name || !last_name || !email || !user_id) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const query = 'INSERT INTO clients (first_name, last_name, email, phone, birth_date, address, rfc, interested_product, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [first_name, last_name, email, phone, birth_date, address, rfc, interested_product, user_id], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);  
            return res.status(500).json({ error: 'Error al agregar el cliente' });
        }
        res.status(201).json({ message: 'Cliente agregado con éxito', client_id: results.insertId });
    });
});

// Ruta para actualizar un cliente existente
app.put('/api/clients/:id', (req, res) => {
    const clientId = req.params.id;
    const { first_name, last_name, email, phone, birth_date, address, rfc, interested_product, user_id } = req.body;

    // Verificar que al menos un campo esté presente para actualizar
    if (!first_name && !last_name && !email && !phone && !birth_date && !address && !rfc && !interested_product) {
        return res.status(400).json({ error: 'No se han proporcionado datos para actualizar' });
    }

    const query = `
        UPDATE clients 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, birth_date = ?, address = ?, rfc = ?, interested_product = ?, user_id = ? 
        WHERE client_id = ?
    `;

    db.query(query, [first_name, last_name, email, phone, birth_date, address, rfc, interested_product, user_id, clientId], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).json({ error: 'Error al actualizar el cliente' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente actualizado con éxito' });
    });
});


// Ruta para eliminar un cliente
app.delete('/api/clients/:id', (req, res) => {
    const clientId = req.params.id;

    const query = 'DELETE FROM clients WHERE client_id = ?';

    db.query(query, [clientId], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).json({ error: 'Error al eliminar el cliente' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente eliminado con éxito' });
    });
});


//Ruta para obtener el lead status
app.get('/api/leadStatus/:userId', (req, res) =>{
    const userId = req.params.userId
    db.query('SELECT lead_status FROM clients WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
        return res.status(500).json({ error: 'Error al obtener los clientes' });
        }
        res.json(results);
    });
});

// Ruta para obtener todas las actividades de un cliente
app.get('/api/activitiesClient/:clientId', (req, res) => {
    const clientId = req.params.clientId;
    const query = `
        SELECT
            a.activity_id,
            a.client_id,
            a.activity_type,
            a.notes,
            a.user_id,
            a.activity_date,
            c.first_name AS client_first_name,
            c.last_name AS client_last_name
        FROM
            activities a
        JOIN
            clients c ON a.client_id = c.client_id
        WHERE
            a.client_id = ?
    `;
    db.query(query, [clientId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las actividades del cliente' });
        }
        res.json(results);
    });
});

app.get('/api/activities', (req, res) => {
    const query = `
        SELECT 
            a.activity_id,
            a.activity_type,
            a.notes,
            a.activity_date,
            c.first_name AS client_name
        FROM activities a
        JOIN clients c ON a.client_id = c.client_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las actividades' });
        }
        res.json(results);
    });
});

app.get('/api/activities/:id', (req, res) => {
    const activityId = req.params.id;

    const query = `
        SELECT 
            a.activity_id,
            a.activity_type,
            a.notes,
            a.activity_date,
            c.first_name AS client_name
        FROM activities a
        JOIN clients c ON a.client_id = c.client_id
        WHERE a.activity_id = ?
    `;

    db.query(query, [activityId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener la actividad' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }
        res.json(results[0]);
    });
});


app.put('/api/activities/:id', (req, res) => {
    const activityId = req.params.id;
    const { activity_type, notes, client_id, activity_date } = req.body;

    const query = `
        UPDATE activities
        SET activity_type = ?, notes = ?, client_id = ?, activity_date = ?
        WHERE activity_id = ?
    `;

    db.query(query, [activity_type, notes, client_id, activity_date, activityId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar la actividad' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }
        res.json({ message: 'Actividad actualizada con éxito' });
    });
});

app.delete('/api/activities/:id', (req, res) => {
    const activityId = req.params.id;

    db.query('DELETE FROM activities WHERE activity_id = ?', [activityId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar la actividad' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }
        res.json({ message: 'Actividad eliminada con éxito' });
    });
});




// Ruta para obtener todas las actividades de un usuario
app.get('/api/activitiesUser/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT
            a.activity_id,
            a.client_id,
            a.activity_type,
            a.notes,
            a.user_id,
            a.activity_date,
            c.first_name AS client_first_name,
            c.last_name AS client_last_name
        FROM
            activities a
        JOIN
            clients c ON a.client_id = c.client_id
        WHERE
            a.user_id = ?
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las actividades del usuario' });
        }
        res.json(results);
    });
});

//Ruta para registrar una actividad
app.post('/api/addActivity', (req, res) =>{
    console.log("Solicitud recibida: ", req.body);

    const{ client_id, activity_type, notes, user_id, activity_date } = req.body;

    const query = 'INSERT INTO activities(client_id, activity_type, notes, user_id, activity_date) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [client_id, activity_type, notes, user_id, activity_date], (err, results) => {
        if(err){
            console.error("Error en la consulta:", err);
            return res.status(500).json({error: 'Error al agregar actividad'});
        }
        res.status(201).json({ message: 'Actividad agregada con éxito', activity_id: results.insertId})
    })
});

app.get('/api/sales', (req, res) => {
    const query = `
        SELECT 
            s.sale_id,
            s.sale_price,
            s.sale_date,
            c.first_name AS client_name,
            a.make AS car_make,
            a.model AS car_model,
            u.name AS seller_name
        FROM sales s
        JOIN clients c ON s.client_id = c.client_id
        JOIN cars a ON s.car_id = a.car_id
        JOIN users u ON s.user_id = u.user_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las ventas' });
        }
        res.json(results);
    });
});


app.get('/api/sales/:id', (req, res) => {
    const saleId = req.params.id;

    const query = `
        SELECT 
            s.sale_id,
            s.sale_price,
            s.sale_date,
            c.first_name AS client_name,
            a.make AS car_make,
            a.model AS car_model,
            u.name AS seller_name
        FROM sales s
        JOIN clients c ON s.client_id = c.client_id
        JOIN cars a ON s.car_id = a.car_id
        JOIN users u ON s.user_id = u.user_id
        WHERE s.sale_id = ?
    `;

    db.query(query, [saleId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener la venta' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json(results[0]);
    });
});


app.post('/api/sales', (req, res) => {
    const { client_id, car_id, user_id, sale_price, sale_date } = req.body;

    const query = `
        INSERT INTO sales (client_id, car_id, user_id, sale_price, sale_date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [client_id, car_id, user_id, sale_price, sale_date], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al registrar la venta' });
        }
        res.status(201).json({ message: 'Venta registrada con éxito', sale_id: results.insertId });
    });
});

app.put('/api/sales/:id', (req, res) => {
    const saleId = req.params.id;
    const { client_id, car_id, user_id, sale_price, sale_date } = req.body;

    const query = `
        UPDATE sales 
        SET client_id = ?, car_id = ?, user_id = ?, sale_price = ?, sale_date = ?
        WHERE sale_id = ?
    `;

    db.query(query, [client_id, car_id, user_id, sale_price, sale_date, saleId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar la venta' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json({ message: 'Venta actualizada con éxito' });
    });
});

app.delete('/api/sales/:id', (req, res) => {
    const saleId = req.params.id;

    db.query('DELETE FROM sales WHERE sale_id = ?', [saleId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar la venta' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        res.json({ message: 'Venta eliminada con éxito' });
    });
});

app.get('/api/clients/:client_id/sales', (req, res) => {
    const clientId = req.params.client_id;

    const query = `
        SELECT 
            s.sale_id,
            s.price,
            s.sale_date,
            c.brand,
            c.model
        FROM sales s
        JOIN cars c ON s.car_id = c.car_id
        WHERE s.client_id = ?
    `;

    db.query(query, [clientId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener ventas del cliente' });
        }
        res.json(results);
    });
});


app.get('/api/clients/:client_id/activities', (req, res) => {
    const clientId = req.params.client_id;

    const query = `
        SELECT 
            activity_id,
            activity_type,
            notes,
            activity_date
        FROM activities
        WHERE client_id = ?
    `;

    db.query(query, [clientId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener actividades del cliente' });
        }
        res.json(results);
    });
});


app.get('/api/cars/:car_id/sales', (req, res) => {
    const carId = req.params.car_id;

    const query = `
        SELECT 
            s.sale_id,
            s.price,
            s.sale_date,
            cl.first_name AS client_name
        FROM sales s
        JOIN clients cl ON s.client_id = cl.client_id
        WHERE s.car_id = ?
    `;

    db.query(query, [carId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener ventas del auto' });
        }
        res.json(results);
    });
});


app.get('/api/cars/:car_id/sales', (req, res) => {
    const carId = req.params.car_id;

    const query = `
        SELECT 
            s.sale_id,
            s.price,
            s.sale_date,
            cl.first_name AS client_name
        FROM sales s
        JOIN clients cl ON s.client_id = cl.client_id
        WHERE s.car_id = ?
    `;

    db.query(query, [carId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener ventas del auto' });
        }
        res.json(results);
    });
});

app.get('/api/sales/:sale_id/activities', (req, res) => {
    const saleId = req.params.sale_id;

    const query = `
        SELECT 
            activity_id,
            activity_type,
            notes,
            activity_date
        FROM activities
        WHERE sale_id = ?
    `;

    db.query(query, [saleId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener actividades de la venta' });
        }
        res.json(results);
    });
});

app.get('/api/salesUser/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT sales.*, clients.name, clients.lastname
        FROM sales
        JOIN clients ON sales.client_id = clients.client_id
        WHERE sales.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las ventas del usuario' });
        }
        res.json(results);
    });
});





// Iniciar el servidorñ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


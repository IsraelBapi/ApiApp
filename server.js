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

// Ruta para registrar un cliente 
app.post('/api/clients', (req, res) => {
    console.log("Solicitud recibida:", req.body); 

    const { first_name, last_name, email, phone, birth_date, address, rfc, interested_product, user_id } = req.body;
    const query = 'INSERT INTO clients (first_name, last_name, email, phone, birth_date, address, rfc, interested_product, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [first_name, last_name, email, phone, birth_date, address, rfc, interested_product, user_id], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);  
            return res.status(500).json({ error: 'Error al agregar el cliente' });
        }
        res.status(201).json({ message: 'Cliente agregado con éxito', client_id: results.insertId });
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

app.get('/api/salesUser/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT
            s.sale_id,
            s.sale_date,
            s.sale_price,
            s.client_id,
            s.car_id,
            c.first_name AS client_first_name,
            c.last_name AS client_last_name,
            c.phone AS client_phone,
            c.email AS client_email,
            car.make AS car_make,
            car.model AS car_model,
            car.year AS car_year,
            car.price AS car_list_price
        FROM
            sales s
        JOIN
            clients c ON s.client_id = c.client_id
        JOIN
            cars car ON s.car_id = car.car_id
        WHERE
            s.user_id = ?
    `;
    
    db.query(query, [userId], (err, results) => {
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


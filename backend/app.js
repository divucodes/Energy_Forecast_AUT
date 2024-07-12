require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const port = 3000;


app.use(cors({
  origin: 'http://localhost:3001', 
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type'
}));

app.use(express.json()); 


const upload = multer({ dest: 'uploads/' });


const users = [
  { email: 'divu20@gmail.com', password: 'divu20' } 
];


const generateToken = (email) => {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not defined in the environment variables');
  }
  return jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
};


app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  console.log(`Received login request: ${email}, ${password}`); // Debugging line

  const user = users.find(user => user.email === email && user.password === password);

  if (user) {
    const token = generateToken(email);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/', async (req, res) => {
  res.send('Server is running');
});

app.post('/api/upload-csv', upload.single('file'), async (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).json({ error: 'File is required' });
  }

  try {
    const content = await fs.readFile(file.path, 'utf-8');
    const parsedData = parse(content, { columns: true });

    const csvFile = await prisma.cSVFile.create({
      data: {
        name: path.parse(file.originalname).name,
        rows: {
          create: parsedData.map(row => ({
            date: row.date,
            time: row.time,
            priceFcst: parseFloat(row.price_fcst),
            actualPrice: parseFloat(row.actual_price),
          })),
        },
      },
    });

    res.json(csvFile);
  } catch (error) {
    console.error('Error uploading CSV file:', error);
    res.status(500).json({ error: 'Failed to upload CSV file' });
  } finally {
 
    await fs.unlink(file.path);
  }
});


app.get('/api/csv-files', async (req, res) => {
  try {
    const csvFiles = await prisma.cSVFile.findMany({
      select: { name: true }
    });

    const fileNames = csvFiles.map(file => file.name);
    res.json(fileNames);
  } catch (error) {
    console.error('Error getting CSV file names:', error);
    res.status(500).json({ error: 'An error occurred while fetching the CSV file names' });
  }
});

app.get('/api/csv-data', async (req, res) => {
  try {
    const csvFiles = await prisma.cSVFile.findMany({
      include: {
        rows: true,
      },
    });

    const results = csvFiles.reduce((acc, file) => {
      acc[file.name] = file.rows;
      return acc;
    }, {});

    res.json(results);
  } catch (error) {
    console.error('Error getting CSV data:', error); 
    res.status(500).json({ error: 'An error occurred while processing the CSV files' });
  }
});


app.get('/api/csv-data/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const csvFile = await prisma.cSVFile.findFirst({
      where: { name: filename },
      include: { rows: true },
    });

    if (csvFile) {
      res.json(csvFile.rows);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error getting CSV file data:', error); 
    res.status(500).json({ error: 'An error occurred while processing the CSV file' });
  }
});


app.use((err, req, res, next) => {
  console.error('Error middleware:', err); 
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

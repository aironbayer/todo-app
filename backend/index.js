const express = require('express');
const { User } = require('./models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, 'segredo_super_secreto');
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha inválida' });
    }
const token = jwt.sign(
  { id: user.id, email: user.email },
  'segredo_super_secreto',
  { expiresIn: '1d' }
);
   return res.json({
  message: 'Login realizado com sucesso',
  token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email
  }
});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// rota raiz
app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

app.use(cors());

app.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findByPk(req.userId, {
    attributes: ['id', 'name', 'email']
  });

  return res.json(user);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



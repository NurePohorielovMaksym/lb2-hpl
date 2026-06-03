const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

let products = [
  { id: 1, name: 'Ноутбук', price: 25000, category: 'Електроніка', description: 'Потужний ноутбук' },
  { id: 2, name: 'Навушники', price: 3000, category: 'Електроніка', description: 'Бездротові навушники' },
  { id: 3, name: 'Стіл', price: 5000, category: 'Меблі', description: 'Офісний стіл' },
  { id: 4, name: 'Крісло', price: 4000, category: 'Меблі', description: 'Зручне крісло' },
]

let orders = []
let users = [
  { id: 1, username: 'admin', password: 'admin123' }
]

// Товари
app.get('/api/products', (req, res) => res.json(products))

app.post('/api/products', (req, res) => {
  const product = { id: Date.now(), ...req.body }
  products.push(product)
  res.json(product)
})

// Замовлення
app.get('/api/orders', (req, res) => res.json(orders))

app.post('/api/orders', (req, res) => {
  const order = { id: Date.now(), ...req.body, date: new Date().toLocaleDateString() }
  orders.push(order)
  res.json(order)
})

// Авторизація
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username && u.password === password)
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username } })
  } else {
    res.status(401).json({ success: false, message: 'Невірний логін або пароль' })
  }
})

app.post('/api/register', (req, res) => {
  const { username, password } = req.body
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Користувач вже існує' })
  }
  const user = { id: Date.now(), username, password }
  users.push(user)
  res.json({ success: true, user: { id: user.id, username: user.username } })
})

app.listen(3000, () => console.log('Сервер запущено на порту 3000'))